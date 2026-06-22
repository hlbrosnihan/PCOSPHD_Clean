// =============================================================================
// MappingToolSurvey_v4.tsx
// Version History:
//   v1 – HTML preview iteration
//   v2 – production React component, two-endpoint submission
//   v3 – device detection, Option B modal, consent gate, adaptive zoom
//   v4 – 2025-06-01
//          - PLACEHOLDER page inside the modal replaces the real tool iframe.
//            When the real embed file is ready, swap the <PlaceholderTool/>
//            component for the <iframe> — everything else stays identical.
//          - All 8 guidelines from Guidelines.md are implemented:
//            Rule 1: consent gate — button disabled until all ticks + signature
//            Rule 2: fixed inset-0 modal, survey never unmounts behind it
//            Rule 3: postMessage zoom on iframe load (wired, ready to enable)
//            Rule 4: sections 1–11 locked behind toolCompleted flag
//            Rule 5: mobile hard block + tablet soft banner
//            Rule 6: embed file contract documented in comments
//            Rule 7: no scroll on modal close — setCurrentSection(1) only
//            Rule 8: component exported standalone, no Header/Footer
//          - Tailwind v4 / SWC safe throughout
// =============================================================================

import {
  Map, Clock, Star, ZoomIn, Layout, Wrench, MessageSquare,
  GitMerge, Mic, Palette, Brain, Lightbulb, FileText, PenLine,
  ChevronLeft, ChevronRight, Check, CheckCircle2, AlertCircle,
  Info, Monitor, Tablet, Smartphone, Copy, ExternalLink, X,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Device detection hook — Rule 5
// ---------------------------------------------------------------------------
type DeviceClass = "mobile" | "tablet" | "desktop";
function useDeviceClass(): DeviceClass {
  const [device, setDevice] = useState<DeviceClass>("desktop");
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setDevice(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return device;
}

// ---------------------------------------------------------------------------
// Submit helpers
// ---------------------------------------------------------------------------
async function submitSurveyPayload(data: Record<string, unknown>) {
  const res = await fetch("/mapping-submit.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (r) => {
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return r.ok ? r.json() : null;
  }).catch(() => null);

  if (res) return res;

  const count = parseInt(localStorage.getItem("mapping_survey_count") || "0") + 1;
  localStorage.setItem("mapping_survey_count", String(count));
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const filename = `mapping_survey_${String(count).padStart(3, "0")}_${suffix}.json`;
  const blob = new Blob([JSON.stringify({ _meta: { filename, timestamp: new Date().toISOString() }, ...data }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { filename };
}

async function submitContactOptIn(name: string, email: string) {
  await fetch("/mapping-contacts.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, timestamp: new Date().toISOString(), source: "mapping_tool_survey" }),
  }).catch(() => null);
}

// ---------------------------------------------------------------------------
// Emoji scale data
// ---------------------------------------------------------------------------
interface EmojiOption { value: string; emoji: string; label: string; }
const SCALE_DIFFICULTY: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Very difficult" },{ value:"2",emoji:"🙁",label:"Difficult" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Easy" },
  { value:"5",emoji:"😄",label:"Very easy" },
];
const SCALE_CLARITY: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Very unclear" },{ value:"2",emoji:"🙁",label:"Unclear" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Clear" },
  { value:"5",emoji:"😄",label:"Very clear" },
];
const SCALE_USEFUL: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Not useful" },{ value:"2",emoji:"🙁",label:"Slightly useful" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Useful" },
  { value:"5",emoji:"😄",label:"Very useful" },
];
const SCALE_HELPFUL: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Not helpful" },{ value:"2",emoji:"🙁",label:"Slightly helpful" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Helpful" },
  { value:"5",emoji:"😄",label:"Very helpful" },
];
const SCALE_RELEVANT: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Not relevant" },{ value:"2",emoji:"🙁",label:"Slightly relevant" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Relevant" },
  { value:"5",emoji:"😄",label:"Very relevant" },
];
const SCALE_MEANINGFUL: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Not meaningful" },{ value:"2",emoji:"🙁",label:"Slightly" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Meaningful" },
  { value:"5",emoji:"😄",label:"Very meaningful" },
];
const SCALE_AUDIO: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Very poor" },{ value:"2",emoji:"🙁",label:"Poor" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Good" },
  { value:"5",emoji:"😄",label:"Excellent" },
];
const SCALE_DESIGN: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Strongly dislike" },{ value:"2",emoji:"🙁",label:"Dislike" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Like" },
  { value:"5",emoji:"😄",label:"Strongly like" },
];
const SCALE_REFLECT: EmojiOption[] = [
  { value:"1",emoji:"😞",label:"Not at all" },{ value:"2",emoji:"🙁",label:"A little" },
  { value:"3",emoji:"😐",label:"Neutral" },{ value:"4",emoji:"🙂",label:"Somewhat" },
  { value:"5",emoji:"😄",label:"Strongly" },
];

// ---------------------------------------------------------------------------
// Reusable UI sub-components
// ---------------------------------------------------------------------------
function EmojiScale({ options, selected, onSelect }: { options: EmojiOption[]; selected: string; onSelect: (v: string) => void; }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onSelect(opt.value)}
          style={{ minWidth: "80px", minHeight: "84px" }}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all hover:scale-105 flex-1 ${selected === opt.value ? "border-teal-600 bg-teal-50 shadow-md scale-105" : "border-gray-200 bg-white hover:border-teal-300"}`}>
          <span className="text-2xl mb-1">{opt.emoji}</span>
          <span className="text-xs text-gray-600 text-center leading-tight">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function YesNoToggle({ value, onChange, labels = ["Yes", "No"] as [string, string] }: { value: string; onChange: (v: string) => void; labels?: [string, string]; }) {
  return (
    <div className="flex gap-3">
      {labels.map((lbl) => (
        <button key={lbl} type="button" onClick={() => onChange(lbl)}
          className={`px-6 py-3 rounded-lg border-2 font-medium transition-all text-sm ${value === lbl ? "border-teal-600 bg-teal-600 text-white shadow-md" : "border-gray-200 bg-white text-gray-700 hover:border-teal-400"}`}>
          {lbl}
        </button>
      ))}
    </div>
  );
}

function ConsentRow({ text, checked, onChange }: { text: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:bg-gray-100 hover:border-teal-200 cursor-pointer transition-all">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 flex-shrink-0 accent-teal-600 cursor-pointer" />
      <span className="text-sm text-gray-800 leading-relaxed">{text}</span>
    </label>
  );
}

function OpenText({ name, value, onChange, placeholder, rows = 3 }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }) {
  return (
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none text-sm" />
  );
}

// ---------------------------------------------------------------------------
// PlaceholderTool — shown inside the modal until the real embed is ready.
// Rule 6: when pcosphd_mapping_vN_embed.html is ready, replace this entire
// component with:
//   <iframe
//     ref={iframeRef}
//     src="/pcosphd_mapping_vN_embed.html"
//     title="PCOS Lived Experience Mapping Tool"
//     onLoad={handleIframeLoad}
//     className="flex-1 w-full border-0"
//     style={{ minHeight: 0 }}
//   />
// The onLoad handler (below in MappingToolModal) sends the setZoom message.
// ---------------------------------------------------------------------------
function PlaceholderTool() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{
        background: "var(--color-background-tertiary, #F3F4F6)",
        backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full mx-8 text-center border border-gray-200">
        {/* Tool icon */}
        <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Map size={32} className="text-white" />
        </div>

        <h2 className="text-teal-900 text-xl font-bold mb-2">
          Mapping Tool
        </h2>

        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          The PCOS Lived Experience Mapping Tool will load here.
        </p>

        {/* Replace notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-4">
          <p className="text-amber-900 text-xs font-bold mb-1 uppercase tracking-wide">Developer note</p>
          <p className="text-amber-800 text-xs leading-relaxed">
            This placeholder is shown until{" "}
            <code className="bg-amber-100 px-1 rounded">pcosphd_mapping_vN_embed.html</code>{" "}
            is ready. Replace <code className="bg-amber-100 px-1 rounded">{"<PlaceholderTool />"}</code>{" "}
            with an <code className="bg-amber-100 px-1 rounded">{"<iframe>"}</code> pointing to the
            embed file. The modal, zoom messaging, and close handlers are all
            wired and ready.
          </p>
        </div>

        {/* Simulate dimensions / zoom context */}
        <p className="text-xs text-gray-400">
          The real tool canvas is ~2200px wide at zoom 1.0. The iframe zoom
          is set via <code className="bg-gray-100 px-1 rounded">postMessage</code> on load
          to fill this modal at approximately 90% of the available content width.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MobileDevicePrompt — Rule 5, mobile hard block
// ---------------------------------------------------------------------------
function MobileDevicePrompt({ onContinueAnyway }: { onContinueAnyway: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Smartphone className="text-amber-600" size={24} />
          </div>
          <div className="text-gray-300 text-2xl">→</div>
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <Tablet className="text-teal-600" size={24} />
          </div>
          <div className="text-gray-300 text-2xl">→</div>
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <Monitor className="text-teal-600" size={24} />
          </div>
        </div>
        <h2 className="text-gray-900 mb-3 text-xl">Best on a larger screen</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          The mapping tool requires space to create and explore your health journey map.
          For the best experience, please open this link on a{" "}
          <strong className="text-gray-800">tablet or laptop</strong>.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-500 font-mono break-all mb-4">
          {typeof window !== "undefined" ? window.location.href : "/mapping-survey"}
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={copyLink}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
            {copied ? <><Check size={16} /> Link copied!</> : <><Copy size={16} /> Copy link to open elsewhere</>}
          </button>
          <button onClick={onContinueAnyway}
            className="w-full py-3 bg-white text-gray-600 rounded-lg font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            Continue on this device anyway
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-5 leading-relaxed">
          You can complete the survey on mobile, but the mapping tool works best with more screen space.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TabletAdvisoryBanner — Rule 5, tablet soft warning
// ---------------------------------------------------------------------------
function TabletAdvisoryBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
      <Tablet className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <p className="text-amber-900 font-semibold text-sm mb-1">Landscape orientation recommended</p>
        <p className="text-amber-800 text-xs leading-relaxed">
          The mapping tool works on tablets, but you will get the best experience in
          landscape mode or on a laptop. The canvas is horizontally arranged.
        </p>
      </div>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MappingToolModal — Rule 2 (fixed overlay), Rule 3 (postMessage zoom),
//                   Rule 7 (no scroll on close)
// ---------------------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  modalWidth: number;
  onClose: () => void;
}

function MappingToolModal({ isOpen, modalWidth, onClose }: ModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Rule 3 — send zoom to iframe when it loads.
  // SIDEBAR_WIDTH = 148px (from pcosphd_mapping layout).
  // PADDING = 32px (modal inner padding).
  // CVW_APPROX = ~2200px (17 columns at NW=118, GX=20).
  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current) return;
    const SIDEBAR_WIDTH = 148;
    const PADDING = 32;
    const CVW_APPROX = 2200;
    const contentWidth = modalWidth - SIDEBAR_WIDTH - PADDING;
    const idealZoom = parseFloat(
      Math.min(1.0, Math.max(0.30, (contentWidth * 0.9) / CVW_APPROX)).toFixed(2)
    );
    iframeRef.current.contentWindow?.postMessage({ type: "setZoom", zoom: idealZoom }, "*");
  }, [modalWidth]);

  // Listen for toolDone message from the embed's own Done button
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "toolDone") onClose();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    // Rule 2 — fixed inset-0, survey stays mounted behind this
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="flex flex-col flex-1 m-3 rounded-xl overflow-hidden bg-white shadow-2xl">

        {/* Modal header — matches the tool's own dark teal header style */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ background: "#134e4a", height: "44px" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
              <Map size={13} className="text-white" />
            </div>
            <span className="text-white text-sm font-semibold">PCOS Lived Experience Mapping Tool</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", color: "#ccfbf1" }}
            >
              Alpha
            </span>
          </div>
          {/* Always-visible done button — Rule 2 */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.25)" }}
          >
            <Check size={13} />
            Done — return to survey
          </button>
        </div>

        {/*
          ── TOOL CONTENT ─────────────────────────────────────────────────────
          Currently renders the placeholder. When the real embed is ready:

          Replace <PlaceholderTool /> with:

            <iframe
              ref={iframeRef}
              src="/pcosphd_mapping_vN_embed.html"
              title="PCOS Lived Experience Mapping Tool"
              onLoad={handleIframeLoad}
              className="flex-1 w-full border-0"
              style={{ minHeight: 0 }}
              allow="clipboard-write"
            />

          The handleIframeLoad and postMessage zoom logic above are already
          wired — no other changes needed.
          ─────────────────────────────────────────────────────────────────── */}
        <PlaceholderTool />

        {/* Modal footer — second always-visible done button */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0">
          <span className="text-xs text-gray-400">
            Your survey progress is saved while you map — take as long as you need.
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Check size={13} />
            Done — return to survey
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CONSENT_ITEMS = [
  "I confirm that I have read and understood the Participant Information above, have had the opportunity to ask questions, and understand that my participation is voluntary and that I am free to withdraw at any time before submitting my responses, without giving a reason.",
  "I understand that no personal or demographic data is being collected, all questionnaire responses are anonymous, and any maps I create will not be collected, stored, or viewed by the researcher.",
  "I understand that anonymised data may be used in academic outputs (e.g. thesis, publications, presentations).",
  "I understand that limited photographs and/or video recordings may be taken at the conference stall. I confirm that I will only be included if I provide explicit opt-in consent (e.g. via sticker), and that no identifiable images will be captured.",
];

const SECTIONS = [
  { label: "Consent",   Icon: PenLine },
  { label: "Overall",   Icon: Star },
  { label: "Purpose",   Icon: ZoomIn },
  { label: "Usability", Icon: Layout },
  { label: "Features",  Icon: Wrench },
  { label: "Prompts",   Icon: MessageSquare },
  { label: "Mapping",   Icon: GitMerge },
  { label: "Audio",     Icon: Mic },
  { label: "Design",    Icon: Palette },
  { label: "Engage",    Icon: Brain },
  { label: "Uses",      Icon: Lightbulb },
  { label: "Finish",    Icon: FileText },
];

// ---------------------------------------------------------------------------
// Main component — Rule 8: exported standalone, no Header/Footer wrapper
// ---------------------------------------------------------------------------
export function MappingToolSurvey() {
  const device = useDeviceClass();
  const [mobileOverridden, setMobileOverridden] = useState(false);
  const [tabletBannerDismissed, setTabletBannerDismissed] = useState(false);

  // Consent state — Rule 1
  const [consentTicks, setConsentTicks] = useState([false, false, false, false]);
  const [signature, setSignature] = useState("");
  const [consentError, setConsentError] = useState(false);
  const isConsentDone = consentTicks.every(Boolean) && signature.trim() !== "";

  // Tool modal — Rules 2, 3, 7
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [toolCompleted, setToolCompleted] = useState(false);
  const [modalWidth, setModalWidth] = useState(0);

  useEffect(() => {
    if (!toolModalOpen) return;
    const t = setTimeout(() => setModalWidth(window.innerWidth - 24), 50);
    return () => clearTimeout(t);
  }, [toolModalOpen]);

  const openTool = () => {
    if (!isConsentDone) { setConsentError(true); return; }
    setToolModalOpen(true);
  };

  // Rule 7 — no scroll on close. setCurrentSection(1) renders Section 1
  // in the exact same viewport position. No scrollTo called here.
  const closeTool = useCallback(() => {
    setToolModalOpen(false);
    setToolCompleted(true);
    setCurrentSection(1);
  }, []);

  // Section navigation — Rule 4
  const [currentSection, setCurrentSection] = useState(0);
  const progressPct = Math.round(((currentSection + 1) / SECTIONS.length) * 100);

  const navigate = (dir: number) => {
    if (dir === 1 && currentSection === 0 && !isConsentDone) { setConsentError(true); return; }
    if (dir === 1 && currentSection === 0 && !toolCompleted) { return; }
    const next = currentSection + dir;
    if (next >= 0 && next < SECTIONS.length) {
      setCurrentSection(next);
      // Only smooth scroll on manual nav — not on tool close (Rule 7)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goTo = (idx: number) => {
    if (idx > 0 && !isConsentDone) { setConsentError(true); return; }
    setCurrentSection(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form state
  const [form, setForm] = useState({
    overallRating:"", overallDescription:"",
    purposeClarity:"", purposeDescription:"",
    navigationEase:"", whatWorkedWell:"", whatWasConfusing:"",
    featuresUsefulness:"", featuresUsedMost:"", featuresMissing:"",
    promptsHelpfulness:"", promptsRelevance:"", touchpointsEase:"",
    promptsLikes:"", promptsDislikes:"", promptsMissing:"",
    connectionsEase:"", connectionsMeaningfulness:"", mappingChangedThinking:"",
    usedAudio:"", audioRating:"", audioFeedback:"",
    designFeeling:"", designLikes:"", designChanges:"",
    promptedReflection:"", reflectionDescription:"",
    overallUsefulness:"", potentialApplications:"",
    mostValuable:"", mostImportantChange:"", additionalComments:"",
  });

  const [wantsUpdates, setWantsUpdates] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const setField = (field: keyof typeof form, value: string) => setForm({ ...form, [field]: value });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleConsent = (i: number, v: boolean) => {
    const next = [...consentTicks]; next[i] = v; setConsentTicks(next);
    setConsentError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError(null);
    try {
      await submitSurveyPayload({
        _consent: { signature, timestamp: new Date().toISOString() },
        ...form,
      } as unknown as Record<string, unknown>);
      if (wantsUpdates === "Yes, keep me updated" && contactName.trim() && contactEmail.trim()) {
        await submitContactOptIn(contactName.trim(), contactEmail.trim());
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  // ── Mobile gate — Rule 5 ─────────────────────────────────────────────────
  if (device === "mobile" && !mobileOverridden) {
    return <MobileDevicePrompt onContinueAnyway={() => setMobileOverridden(true)} />;
  }

  // ── Submitted ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-lg w-full text-center">
          <CheckCircle2 className="text-teal-600 mx-auto mb-6" size={48} />
          <h2 className="text-gray-800 mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-2">Your feedback has been saved.</p>
          <p className="text-gray-500 text-sm">Your responses will help improve the mapping tool for future participants.</p>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Rule 2 — modal renders at root level, covers survey without unmounting it */}
      <MappingToolModal isOpen={toolModalOpen} modalWidth={modalWidth} onClose={closeTool} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Rule 5 — tablet banner */}
          {device === "tablet" && !tabletBannerDismissed && (
            <TabletAdvisoryBanner onDismiss={() => setTabletBannerDismissed(true)} />
          )}

          {/* Hero */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="relative flex items-center justify-center"
              style={{ height: "180px", background: "linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #5eead4 100%)" }}>
              <div className="text-white text-center px-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Map size={36} />
                  <h1 className="text-white text-2xl sm:text-3xl">Mapping Tool Feedback Survey</h1>
                </div>
                <div className="flex items-center justify-center gap-2 text-teal-100 text-sm">
                  <Clock size={14} />
                  <span>Estimated completion time: 8–10 minutes</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed">
              Thank you for taking part in the demo session. Your honest feedback will directly shape the
              development of this tool. There are no right or wrong answers.
            </div>
          </div>

          {/* Tab nav + progress */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">{SECTIONS[currentSection].label}</span>
              <span className="text-sm font-medium text-teal-600">{progressPct}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full mb-5" style={{ height: "6px" }}>
              <div className="bg-teal-600 rounded-full transition-all duration-300"
                style={{ height: "6px", width: `${progressPct}%` }} />
            </div>
            {/*
              Inline grid style used here instead of Tailwind grid-cols-6.
              Reason: Tailwind v4 with SWC compiler does not reliably process
              grid-cols-N utility classes — the class is silently ignored,
              causing all tab buttons to stack vertically.
              Using CSS grid directly with inline style is the safe workaround.
            */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>
              {SECTIONS.map(({ label, Icon }, i) => {
                const state = i === currentSection ? "active" : i < currentSection ? "done" : "future";
                // Inline styles for background/border — avoids dynamic Tailwind class issues
                const btnStyle: React.CSSProperties =
                  state === "active"
                    ? { background: "#0f766e", border: "1px solid #0f766e" }
                    : state === "done"
                    ? { background: "#f0fdfa", border: "1px solid #ccfbf1" }
                    : { background: "#f3f4f6", border: "1px solid transparent" };
                const iconColor = state === "active" ? "#ffffff" : state === "done" ? "#0f766e" : "#9ca3af";
                return (
                  <button key={i} type="button" onClick={() => goTo(i)}
                    aria-label={`Section ${i + 1}: ${label}`} title={label}
                    style={{ ...btnStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 4px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" }}>
                    <Icon size={16} color={iconColor} />
                    {state === "active" && (
                      <span style={{ color: "#ffffff", fontSize: "11px", lineHeight: "1.2", textAlign: "center" }}>{label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 space-y-8">

              {/* ── Section 0: Consent + Tool Launch ──────────── */}
              {currentSection === 0 && (
                <div className="space-y-6">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2">
                    <PenLine size={20} />
                    Consent — Lived Experience Mapping Tool Interface Testing Study
                  </h2>

                  {/* Research Consent Form */}
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-teal-900 font-bold text-base">Research Consent Form</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">The purpose of this research is to evaluate the usability, clarity, and application of a digital mapping tool designed to support the visualisation of personal health experiences, including menstrual health. This testing will inform further development of the tool.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">The research project is being conducted by <strong>Hilary Wray</strong> at Coventry University. You are invited to take part because you are attending the Menstruation Research Conference.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">Your participation is entirely voluntary, and you may withdraw at any time by leaving the activity or closing the browser. If you agree to take part, you will explore the mapping tool and complete a short questionnaire. This will take approximately 5–10 minutes.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">No personal or demographic data will be collected. Any maps you create remain private to you and are not saved or accessed by the researcher.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">All questionnaire responses are anonymous and used only to improve the tool. Data is collected via Coventry.domains and stored securely within University infrastructure.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">If you opt in to receive further information, your contact details will be stored separately and securely until completion of the thesis.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">Participation may prompt reflection on personal experiences. You may stop at any time. No data entered into the tool is stored.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">All information will be handled in accordance with Coventry University policies and the{" "}<a href="https://www.coventry.ac.uk/gdpr-and-data-protection/privacy-notices/" target="_blank" rel="noreferrer" className="text-teal-600 underline">Research Privacy Notice</a>.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">You are free to withdraw until submission of your responses. As data is anonymous, withdrawal after submission may not be possible.</p>
                    <p className="text-gray-700 text-sm leading-relaxed">This research has received ethical approval from Coventry University.</p>
                    <div className="pt-3 mt-1 border-t border-teal-200 text-sm">
                      <p className="text-xs font-bold text-teal-900 uppercase tracking-wide mb-2">Research contact</p>
                      <p className="text-gray-700"><span className="font-semibold text-teal-800">Researcher:</span> Hilary B Wray</p>
                      <p className="text-gray-700"><span className="font-semibold text-teal-800">Department:</span> Centre for Arts and Creative Cultures</p>
                      <p className="text-gray-700"><span className="font-semibold text-teal-800">Contact:</span>{" "}<a href="mailto:wrayh@uni.coventry.ac.uk" className="text-teal-600 underline">wrayh@uni.coventry.ac.uk</a></p>
                    </div>
                  </div>

                  {/* Consent tick boxes — Rule 1 */}
                  <div>
                    <p className="font-medium text-gray-800 mb-3">Please confirm that you understand and agree to the following:</p>
                    <div className="space-y-3">
                      {CONSENT_ITEMS.map((text, i) => (
                        <ConsentRow key={i} text={text} checked={consentTicks[i]} onChange={(v) => toggleConsent(i, v)} />
                      ))}
                    </div>
                  </div>

                  {/* Electronic signature — Rule 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Electronic Signature <span className="text-red-600">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      By typing your full name below, you are providing your electronic signature and consent to participate in this study.
                    </p>
                    <input type="text" value={signature}
                      onChange={(e) => { setSignature(e.target.value); setConsentError(false); }}
                      placeholder="Type your full name here"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "16px" }}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-50 transition-all" />
                    {signature.trim() && (
                      <p className="mt-2 text-sm text-teal-600 flex items-center gap-1">
                        <Check size={14} /> Signature provided: {signature.trim()}
                      </p>
                    )}
                  </div>

                  {consentError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      Please tick all boxes and provide your electronic signature before continuing.
                    </div>
                  )}

                  {/* ── Mapping Tool launch card — Rule 1, 4 ──────────
                      Locked until isConsentDone.
                      After use, shows completion badge and re-open option. */}
                  <div className={`border-2 rounded-xl p-6 text-center transition-all ${isConsentDone ? "border-teal-200 bg-teal-50" : "border-dashed border-gray-200 bg-gray-50"}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${isConsentDone ? "bg-teal-600" : "bg-gray-200"}`}>
                      <Map size={26} className={isConsentDone ? "text-white" : "text-gray-400"} />
                    </div>
                    <h3 className={`font-semibold text-base mb-2 ${isConsentDone ? "text-teal-900" : "text-gray-400"}`}>
                      PCOS Lived Experience Mapping Tool
                    </h3>
                    <p className={`text-sm mb-5 leading-relaxed ${isConsentDone ? "text-gray-700" : "text-gray-400"}`}>
                      {isConsentDone
                        ? "You can now open the mapping tool. Take a few minutes to explore — there is no right or wrong way to use it. When you are done, click the close button to return and complete the feedback survey."
                        : "Please complete all consent items and your electronic signature above before accessing the mapping tool."}
                    </p>
                    {!toolCompleted ? (
                      <button type="button" onClick={openTool} disabled={!isConsentDone}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${isConsentDone ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                        <ExternalLink size={16} />
                        {isConsentDone ? "Open the mapping tool" : "Complete consent to unlock"}
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 text-teal-600 font-medium text-sm">
                          <CheckCircle2 size={18} />
                          Tool session complete
                        </div>
                        <button type="button" onClick={openTool}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-teal-600 border border-teal-200 hover:bg-teal-50 transition-colors">
                          <ExternalLink size={13} />
                          Re-open tool
                        </button>
                        <p className="text-xs text-gray-500">Click Next to continue to the feedback questions.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Sections 1–11: locked until tool used — Rule 4 ─ */}
              {currentSection > 0 && !toolCompleted && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Map size={28} className="text-gray-300" />
                  </div>
                  <h3 className="text-gray-400 font-semibold mb-2">Please use the mapping tool first</h3>
                  <p className="text-gray-400 text-sm mb-4">Return to the Consent section and open the mapping tool before completing the feedback questions.</p>
                  <button type="button" onClick={() => setCurrentSection(0)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                    Back to consent &amp; tool
                  </button>
                </div>
              )}

              {/* Section 1 */}
              {currentSection === 1 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Star size={20} />1. Overall Experience</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How would you rate your overall experience using the tool?</p>
                    <EmojiScale options={SCALE_DIFFICULTY} selected={form.overallRating} onSelect={(v) => setField("overallRating", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Briefly describe your overall experience:</p>
                    <OpenText name="overallDescription" value={form.overallDescription} onChange={handleChange} placeholder="What stood out most during your session?" /></div>
                </div>
              )}
              {currentSection === 2 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><ZoomIn size={20} />2. Understanding the Tool</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How clear was the purpose of the tool?</p>
                    <EmojiScale options={SCALE_CLARITY} selected={form.purposeClarity} onSelect={(v) => setField("purposeClarity", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">In your own words, what do you think the tool is designed to do?</p>
                    <OpenText name="purposeDescription" value={form.purposeDescription} onChange={handleChange} placeholder="Describe your understanding of the tool's purpose..." /></div>
                </div>
              )}
              {currentSection === 3 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Layout size={20} />3. Interface Usability</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How easy was the interface to navigate?</p>
                    <EmojiScale options={SCALE_DIFFICULTY} selected={form.navigationEase} onSelect={(v) => setField("navigationEase", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What aspects of the interface worked well?</p>
                    <OpenText name="whatWorkedWell" value={form.whatWorkedWell} onChange={handleChange} placeholder="E.g. layout, icons, labelling..." /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What was confusing or frustrating?</p>
                    <OpenText name="whatWasConfusing" value={form.whatWasConfusing} onChange={handleChange} placeholder="E.g. unclear instructions, hard to find controls..." /></div>
                </div>
              )}
              {currentSection === 4 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Wrench size={20} />4. Tool Features</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How useful were the available tools (e.g. drawing, connecting, labelling)?</p>
                    <EmojiScale options={SCALE_USEFUL} selected={form.featuresUsefulness} onSelect={(v) => setField("featuresUsefulness", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Which tools did you use most, and why?</p>
                    <OpenText name="featuresUsedMost" value={form.featuresUsedMost} onChange={handleChange} placeholder="Describe the tools you reached for most often..." /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Were any tools missing or difficult to use?</p>
                    <OpenText name="featuresMissing" value={form.featuresMissing} onChange={handleChange} placeholder="Any features you expected but could not find?" /></div>
                </div>
              )}
              {currentSection === 5 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><MessageSquare size={20} />5. Touchpoints and Prompts</h2>
                  <p className="text-gray-500 text-sm">Touchpoints are the guided prompts that appeared to help you reflect and add to your map.</p>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How helpful were the touchpoint prompts?</p>
                    <EmojiScale options={SCALE_HELPFUL} selected={form.promptsHelpfulness} onSelect={(v) => setField("promptsHelpfulness", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How relevant did the prompts feel to your personal experience?</p>
                    <EmojiScale options={SCALE_RELEVANT} selected={form.promptsRelevance} onSelect={(v) => setField("promptsRelevance", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How easy was it to interact with the touchpoints?</p>
                    <EmojiScale options={SCALE_DIFFICULTY} selected={form.touchpointsEase} onSelect={(v) => setField("touchpointsEase", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What did you like about the prompts?</p>
                    <OpenText name="promptsLikes" value={form.promptsLikes} onChange={handleChange} placeholder="E.g. wording, timing, relevance..." rows={2} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What did you dislike?</p>
                    <OpenText name="promptsDislikes" value={form.promptsDislikes} onChange={handleChange} placeholder="E.g. too many, too few, unclear..." rows={2} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Were any prompts missing or unnecessary?</p>
                    <OpenText name="promptsMissing" value={form.promptsMissing} onChange={handleChange} placeholder="Suggestions for different or additional prompts..." rows={2} /></div>
                </div>
              )}
              {currentSection === 6 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><GitMerge size={20} />6. Connections and Mapping</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How easy was it to create connections between elements on the map?</p>
                    <EmojiScale options={SCALE_DIFFICULTY} selected={form.connectionsEase} onSelect={(v) => setField("connectionsEase", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How meaningful did the connections feel once made?</p>
                    <EmojiScale options={SCALE_MEANINGFUL} selected={form.connectionsMeaningfulness} onSelect={(v) => setField("connectionsMeaningfulness", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Did the mapping process change how you think about your experience?</p>
                    <OpenText name="mappingChangedThinking" value={form.mappingChangedThinking} onChange={handleChange} placeholder="E.g. noticed new patterns, made unexpected connections..." rows={4} /></div>
                </div>
              )}
              {currentSection === 7 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Mic size={20} />7. Audio Feature <span className="text-sm font-normal text-gray-400">(optional)</span></h2>
                  <p className="text-gray-500 text-sm">This section is only relevant if you used the audio/voice recording feature.</p>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Did you use the audio feature?</p>
                    <YesNoToggle value={form.usedAudio} onChange={(v) => setField("usedAudio", v)} /></div>
                  {form.usedAudio === "Yes" && (<>
                    <div className="space-y-3"><p className="text-gray-800 font-medium">How would you rate the audio feature?</p>
                      <EmojiScale options={SCALE_AUDIO} selected={form.audioRating} onSelect={(v) => setField("audioRating", v)} /></div>
                    <div className="space-y-3"><p className="text-gray-800 font-medium">What worked well, and what could be improved?</p>
                      <OpenText name="audioFeedback" value={form.audioFeedback} onChange={handleChange} placeholder="E.g. transcription accuracy, ease of use..." /></div>
                  </>)}
                  {form.usedAudio === "No" && <p className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">No problem — you can move on to the next section.</p>}
                </div>
              )}
              {currentSection === 8 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Palette size={20} />8. Visual Style and Design</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How do you feel about the visual design of the tool?</p>
                    <EmojiScale options={SCALE_DESIGN} selected={form.designFeeling} onSelect={(v) => setField("designFeeling", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What did you like about the design?</p>
                    <OpenText name="designLikes" value={form.designLikes} onChange={handleChange} placeholder="E.g. colours, icons, layout, typography..." /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What would you change?</p>
                    <OpenText name="designChanges" value={form.designChanges} onChange={handleChange} placeholder="E.g. too busy, hard to read..." /></div>
                </div>
              )}
              {currentSection === 9 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Brain size={20} />9. Cognitive and Emotional Engagement</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Did using the tool prompt reflection on your health experience?</p>
                    <EmojiScale options={SCALE_REFLECT} selected={form.promptedReflection} onSelect={(v) => setField("promptedReflection", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How did the tool make you think or feel during the session?</p>
                    <OpenText name="reflectionDescription" value={form.reflectionDescription} onChange={handleChange} placeholder="E.g. thought-provoking, emotional, overwhelming, clarifying..." rows={4} /></div>
                </div>
              )}
              {currentSection === 10 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><Lightbulb size={20} />10. Usefulness and Application</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">How useful could a tool like this be in a real-world health context?</p>
                    <EmojiScale options={SCALE_USEFUL} selected={form.overallUsefulness} onSelect={(v) => setField("overallUsefulness", v)} /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Where could you see this tool being used?</p>
                    <OpenText name="potentialApplications" value={form.potentialApplications} onChange={handleChange} placeholder="E.g. clinic appointments, self-management, peer support, research..." rows={4} /></div>
                </div>
              )}
              {currentSection === 11 && toolCompleted && (
                <div className="space-y-8">
                  <h2 className="text-teal-800 text-xl flex items-center gap-2"><FileText size={20} />11. Final Feedback</h2>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What was the most valuable aspect of the tool?</p>
                    <OpenText name="mostValuable" value={form.mostValuable} onChange={handleChange} placeholder="The single thing that stood out most positively..." /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">What is the single most important change you would make?</p>
                    <OpenText name="mostImportantChange" value={form.mostImportantChange} onChange={handleChange} placeholder="The one thing you would prioritise fixing or improving..." /></div>
                  <div className="space-y-3"><p className="text-gray-800 font-medium">Any additional comments?</p>
                    <OpenText name="additionalComments" value={form.additionalComments} onChange={handleChange} placeholder="Anything else you would like to share..." rows={4} /></div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-1"><Info size={16} className="text-teal-600 flex-shrink-0" />
                      <p className="font-semibold text-gray-800">Stay in touch (optional)</p></div>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                      If you would like to receive more information about this research project, please leave your name and email below.
                      Your contact details are stored separately from your survey responses.
                    </p>
                    <YesNoToggle value={wantsUpdates} onChange={setWantsUpdates} labels={["Yes, keep me updated", "No thanks"]} />
                    {wantsUpdates === "Yes, keep me updated" && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm" /></div>
                      </div>
                    )}
                    {wantsUpdates === "No thanks" && <p className="mt-3 text-sm text-gray-500">No problem — your feedback alone is a great contribution.</p>}
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
                    <div className="flex gap-3">
                      <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-teal-800 text-sm leading-relaxed">
                        By clicking <strong>Submit Feedback</strong> you confirm that your responses are an honest reflection of your experience.
                        Survey data stored securely for research purposes. Contact details, if provided, stored separately.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button type="button" onClick={() => navigate(-1)} disabled={currentSection === 0}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${currentSection === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                  <ChevronLeft size={18} /> Previous
                </button>
                <span className="text-gray-500 text-sm order-first sm:order-none">Step {currentSection + 1} of {SECTIONS.length}</span>
                {currentSection < SECTIONS.length - 1 ? (
                  <button type="button" onClick={() => navigate(1)}
                    disabled={currentSection === 0 && !toolCompleted}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${currentSection === 0 && !toolCompleted ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-teal-600 text-white hover:bg-teal-700"}`}>
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? "Saving..." : "Submit Feedback"}
                  </button>
                )}
              </div>
              {submitError && <p className="mt-3 text-sm text-red-600 text-center">{submitError}</p>}
            </div>
          </form>

          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <h3 className="mb-2 text-gray-800 text-sm font-semibold">Privacy and Confidentiality</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              All information collected is strictly confidential and used solely for research purposes.
              Data will be anonymised and stored securely in compliance with the{" "}
              <a href="https://www.coventry.ac.uk/gdpr-and-data-protection/privacy-notices/" target="_blank" rel="noreferrer" className="text-teal-600 underline">
                Coventry University Research Privacy Notice
              </a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}