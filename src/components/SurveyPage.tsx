// =============================================================================
// FILE:    SurveyPage_v2.tsx
// AUTHOR:  Hilary Wray — PCOS PhD Research, Coventry University
// =============================================================================
//
// VERSION HISTORY
// ---------------
// v1.0  — Original SurveyPage.tsx
//          • Full multi-section survey form (consent → demographics → PCOS
//            diagnosis → digital apps → wearables → medical history →
//            lifestyle → quality of life → additional comments)
//          • Consent section with three checkboxes and signature field
//          • Submit handler: Express backend with browser-download fallback
//
// v2.0  — 2026-05-01
//          • Before You Begin: added eligibility criteria in a responsive
//            two-column grid (md:grid-cols-2) above the existing bullet points
//            - Left column  "Who Can Take Part"    — inclusion criteria
//              (age 18–45, PCOS diagnosis, English literacy, able to consent)
//            - Right column "Who Cannot Take Part" — exclusion criteria
//              (age out of range, no diagnosis, pregnant/postpartum, unable
//              to consent)
//          • Icons: teal CheckCircle2 (inclusion) / red XCircle (exclusion)
//            — both already imported, no new dependencies added
//
// =============================================================================

import {
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  FrownIcon,
  SmileIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  X,
  XCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

// Tries to POST to the Express server first.
// In StackBlitz (no backend), the response is HTML not JSON,
// so it automatically falls back to downloading the JSON file locally.
async function submitSurveyData(
  data: Record<string, unknown>,
): Promise<{ filename: string }> {
  const serverResult = await fetch("/submit.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(async (res) => {
      const contentType = res.headers.get("content-type") || "";
      // If server returned HTML (React dev server), there is no Express backend
      if (!contentType.includes("application/json")) return null;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || "Server error",
        );
      }
      return res.json() as Promise<{ filename: string }>;
    })
    .catch(() => null); // network error = no server running

  if (serverResult) {
    // Running on real server — file saved to /submissions/ on server filesystem
    return serverResult;
  }

  // Fallback: StackBlitz or no backend — download JSON directly to browser
  const count =
    parseInt(localStorage.getItem("pcos_submission_count") || "0") + 1;
  localStorage.setItem("pcos_submission_count", String(count));
  const suffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const filename = `submission_${String(count).padStart(3, "0")}_${suffix}.json`;

  const payload = {
    _meta: {
      id: suffix,
      filename,
      submission_number: count,
      timestamp: new Date().toISOString(),
      saved_via: "browser-download-fallback",
    },
    ...data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { filename };
}


export function SurveyPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Consent
    consentUnderstands: false,
    consentAge: false,
    consentAgree: false,
    signature: "",

    // Demographics
    name: "",
    email: "",
    age: "",
    ethnicity: "",

    // PCOS Diagnosis
    diagnosisAge: "",
    diagnosedBy: "",
    diagnosedByOther: "",
    diagnosisExperience: "",
    diagnosisMethod: "",
    symptoms: [] as string[],

    // Digital App Usage
    usesNHSApp: "",
    nhsAppFeatures: [] as string[],
    nhsAppOther: "",
    nhsAppLikes: "",
    nhsAppDislikes: "",
    nhsAppRating: "",
    usesPeriodTracker: "",
    periodTrackerApps: [] as string[],
    periodTrackerOther: "",
    periodTrackerLikes: "",
    periodTrackerDislikes: "",
    periodTrackerRankings: {} as Record<string, string>,
    periodTrackerEffectiveness: {} as Record<string, string>,
    usesNutritionApp: "",
    nutritionApps: [] as string[],
    nutritionAppOther: "",
    nutritionAppLikes: "",
    nutritionAppDislikes: "",
    nutritionAppRankings: {} as Record<string, string>,
    nutritionAppEffectiveness: {} as Record<string, string>,
    usesPCOSApp: "",
    pcosAppName: "",
    pcosAppLikes: "",
    pcosAppDislikes: "",

    // Digital Games
    usesGames: "",
    gameApps: [] as Array<{
      name: string;
      rating: string;
      frequency: string;
    }>,
    gameLikes: "",
    gameDislikes: "",
    usesWearables: "",
    wearableDevices: [] as Array<{
      name: string;
      brand: string;
      rating: string;
    }>,
    wearableLikes: "",
    wearableDislikes: "",
    gamificationInterest: "",

    // Medical History
    previousTreatments: [] as string[],
    currentMedications: "",
    otherConditions: "",
    familyHistory: "",
    hasBeenPregnant: "",
    usedIVF: "",
    timeToPregnancy: "",

    // Lifestyle
    exerciseFrequency: "",
    dietType: "",
    sleepHours: "",
    vitamins: [] as string[],
    vitaminsOther: "",
    socialMediaTime: "",
    socialMediaNetworks: [] as string[],
    socialMediaOther: "",
    socialMediaRankings: {} as Record<string, string>,
    stressLevel: "",

    // Quality of Life
    physicalWellbeing: "",
    emotionalWellbeing: "",
    socialImpact: "",

    // Additional Information
    additionalComments: "",
  });

  const sections = [
    { title: "Consent", icon: "✍️" },
    { title: "Demographics", icon: "👤" },
    { title: "PCOS Diagnosis", icon: "🏥" },
    { title: "Quality of Life", icon: "❤️" },
    { title: "Digital App Usage", icon: "📱" },
    { title: "Digital Games", icon: "🎮" },
    { title: "Medical History", icon: "📋" },
    { title: "Lifestyle Factors", icon: "🏃" },
    { title: "Additional Information", icon: "📝" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleConsentChange = (field: string) => {
    setFormData({
      ...formData,
      [field]: !formData[field as keyof typeof formData],
    });
  };

  const handleCheckboxChange = (
    field:
      | "symptoms"
      | "previousTreatments"
      | "nhsAppFeatures"
      | "periodTrackerApps"
      | "nutritionApps"
      | "vitamins"
      | "socialMediaNetworks",
    value: string,
  ) => {
    const currentValues = formData[field];

    // Special handling for vitamins "None" option
    if (field === "vitamins") {
      if (value === "None") {
        // If "None" is selected, clear all other selections and set only "None"
        const newValues = currentValues.includes("None")
          ? []
          : ["None"];
        setFormData({
          ...formData,
          [field]: newValues,
        });
        return;
      } else {
        // If any other vitamin is selected, remove "None" from selections
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [
              ...currentValues.filter((v) => v !== "None"),
              value,
            ];
        setFormData({
          ...formData,
          [field]: newValues,
        });
        return;
      }
    }

    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setFormData({
      ...formData,
      [field]: newValues,
    });
  };

  const handleRankingChange = (
    network: string,
    rank: string,
  ) => {
    setFormData({
      ...formData,
      socialMediaRankings: {
        ...formData.socialMediaRankings,
        [network]: rank,
      },
    });
  };

  const handleAppRankingChange = (
    app: string,
    rank: string,
    field: "periodTrackerRankings" | "nutritionAppRankings",
  ) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        [app]: rank,
      },
    });
  };

  const handleAppEffectivenessChange = (
    app: string,
    rating: string,
    field:
      | "periodTrackerEffectiveness"
      | "nutritionAppEffectiveness",
  ) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        [app]: rating,
      },
    });
  };

  const addGameApp = () => {
    setFormData({
      ...formData,
      gameApps: [
        ...formData.gameApps,
        { name: "", rating: "", frequency: "" },
      ],
    });
  };

  const removeGameApp = (index: number) => {
    setFormData({
      ...formData,
      gameApps: formData.gameApps.filter((_, i) => i !== index),
    });
  };

  const updateGameApp = (
    index: number,
    field: "name" | "rating" | "frequency",
    value: string,
  ) => {
    const updatedGames = [...formData.gameApps];
    updatedGames[index][field] = value;
    setFormData({
      ...formData,
      gameApps: updatedGames,
    });
  };

  const addWearableDevice = () => {
    setFormData({
      ...formData,
      wearableDevices: [
        ...formData.wearableDevices,
        { name: "", brand: "", rating: "" },
      ],
    });
  };

  const removeWearableDevice = (index: number) => {
    setFormData({
      ...formData,
      wearableDevices: formData.wearableDevices.filter(
        (_, i) => i !== index,
      ),
    });
  };

  const updateWearableDevice = (
    index: number,
    field: "name" | "brand" | "rating",
    value: string,
  ) => {
    const updatedDevices = [...formData.wearableDevices];
    updatedDevices[index][field] = value;
    setFormData({
      ...formData,
      wearableDevices: updatedDevices,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitSurveyData(formData as unknown as Record<string, unknown>);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
    }
    setSubmitting(false);
  };

  const nextSection = () => {
    // Validate consent section before proceeding
    if (currentSection === 0) {
      const allConsentsChecked =
        formData.consentUnderstands &&
        formData.consentAge &&
        formData.consentAgree &&
        formData.signature.trim() !== "";

      if (!allConsentsChecked) {
        alert(
          "Please read and agree to all consent statements and provide your signature to continue.",
        );
        return;
      }
    }

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-lg w-full text-center">
          <CheckCircle2 className="text-teal-600 mx-auto mb-6" size={48} />
          <h2 className="text-gray-800 mb-3">Thank You!</h2>
          <p className="text-gray-500 mb-4">
            Your response has been saved.
          </p>
          
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-48 md:h-64">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJ2ZXklMjBmb3JtfGVufDF8fHx8MTc2MjM0MTAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Survey"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-600/70 flex items-center">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <ClipboardList size={40} />
                  <h1 className="text-white">
                    PCOS Research Survey
                  </h1>
                </div>
                <p className="text-teal-50">
                  Help us better understand your PCOS journey by
                  sharing your experiences. This survey takes
                  approximately 15-20 minutes to complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0"
              size={24}
            />
            <div className="w-full">
              <h3 className="text-blue-900 mb-4">
                Before You Begin
              </h3>

              {/* ── Eligibility Criteria – two-column grid ── */}
              <div className="grid md:grid-cols-2 gap-4 mb-5">

                {/* Inclusion column */}
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
                    {/* Green tick circle to signal "you qualify" */}
                    <CheckCircle2 className="text-teal-600 flex-shrink-0" size={18} />
                    Who Can Take Part
                  </h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0 mt-0.5" size={15} />
                      Women aged 18+ years
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0 mt-0.5" size={15} />
                      Diagnosed with Polycystic Ovary Syndrome (PCOS)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0 mt-0.5" size={15} />
                      Able to read and respond in English
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-teal-500 flex-shrink-0 mt-0.5" size={15} />
                      Able to provide informed consent
                    </li>
                  </ul>
                </div>

                {/* Exclusion column */}
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
                    {/* Red X circle to signal "does not apply" */}
                    <XCircle className="text-red-400 flex-shrink-0" size={18} />
                    Who Cannot Take Part
                  </h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={15} />
                      Under 18 
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={15} />
                      No formal PCOS diagnosis
                    </li>
                   
                    <li className="flex items-start gap-2">
                      <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={15} />
                      Unable to provide informed consent
                    </li>
                  </ul>
                </div>

              </div>
              {/* ── End eligibility grid ── */}

              {/* Original bullet points retained below */}
              <ul className="space-y-1 text-blue-800">
                <li>
                  • All responses are confidential and will be
                  used for research purposes only
                </li>
                <li>
                  • There are no right or wrong answers - we
                  want to hear about your experiences and
                  digital interactions
                </li>
                <li>
                  • You may skip any questions you're not
                  comfortable answering
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-teal-600">
              {Math.round(
                ((currentSection + 1) / sections.length) * 100,
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => {
                  // Only allow navigation if consent is completed or going back to consent
                  if (
                    index === 0 ||
                    (formData.consentUnderstands &&
                      formData.consentAge &&
                      formData.consentAgree &&
                      formData.signature.trim() !== "")
                  ) {
                    setCurrentSection(index);
                  } else {
                    alert(
                      "Please complete the consent form first.",
                    );
                  }
                }}
                className={`p-2 rounded-lg text-center transition-all ${
                  index === currentSection
                    ? "bg-teal-600 text-white"
                    : index < currentSection
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                <div className="text-xl mb-1">
                  {section.icon}
                </div>
                <div className="text-xs hidden md:block">
                  {section.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="mb-6">
              {sections[currentSection].title}
            </h2>

            {/* Consent Section */}
            {currentSection === 0 && (
              <div className="space-y-6">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
                  <h3 className="text-teal-900 mb-4">
                    Research Consent Form
                  </h3>
                  <div className="prose max-w-none text-gray-700 space-y-3">
                    <p></p>
                    <p>
                      {" "}
                      The purpose of the research is to gain an
                      overview of routes into Polycystic Ovarian
                      Syndrome care, including where, when, and
                      by whom digital interventions are used.
                      What they are and how their users
                      experience them. The study is to help
                      inform a heuristic evaluation of
                      applications that are used by patients
                      with PCOS by asking patients first what
                      they are using, why, and what it does for
                      them, related to their PCOS.
                    </p>
                    <p>
                      {" "}
                      <strong>
                        What Your Participation Involves:
                      </strong>
                      You will be asked to complete a survey
                      that takes approximately 15-20 minutes.
                      The survey includes questions about your
                      demographics, PCOS diagnosis, digital app
                      usage, medical history, lifestyle factors,
                      and quality of life. The research project
                      is being conducted by Hilary Wray at
                      Coventry University. You have been
                      selected to take part in this
                      questionnaire survey because you have a
                      diagnosis of Polycystic Ovary Syndrome.
                      Your participation in the survey is
                      entirely voluntary, and you can opt out at
                      any stage by closing and exiting the
                      browser. If you are happy to take part,
                      please answer the following questions
                      relating to PCOS treatment routes and
                      digital usage. Your answers will help us
                      to understand how you found out about your
                      PCOS and what tools you are using to help
                      manage it. As well as how these different
                      interactions impact how you feel.
                    </p>
                    <p>
                      <strong>Confidentiality:</strong> All
                      information you provide will be kept
                      strictly confidential. Your data will be
                      anonymized and stored securely in
                      compliance with GDPR and data protection
                      regulations. Your personal information
                      will not be shared with third parties.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 font-semibold">
                    Please confirm that you understand and agree
                    to the following:
                  </p>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-teal-200 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.consentUnderstands}
                      onChange={() =>
                        handleConsentChange(
                          "consentUnderstands",
                        )
                      }
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-600 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700">
                      I have read and understood the above
                      information.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-teal-200 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.consentAge}
                      onChange={() =>
                        handleConsentChange("consentAge")
                      }
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-600 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700">
                      I confirm that I am aged 18 or over.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border-2 border-transparent hover:border-teal-200 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.consentAgree}
                      onChange={() =>
                        handleConsentChange("consentAgree")
                      }
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-600 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700">
                      I agree to take part in this questionnaire
                      survey.
                    </span>
                  </label>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label
                    htmlFor="signature"
                    className="block mb-3 text-gray-700 font-semibold"
                  >
                    Electronic Signature *
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    By typing your full name below, you are
                    providing your electronic signature and
                    consent to participate in this study.
                  </p>
                  <input
                    type="text"
                    id="signature"
                    name="signature"
                    value={formData.signature}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent font-serif text-lg"
                    placeholder="Type your full name here"
                  />
                  {formData.signature && (
                    <p className="mt-2 text-sm text-teal-600">
                      ✓ Signature provided: {formData.signature}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex gap-3">
                    <AlertCircle
                      className="text-blue-600 flex-shrink-0"
                      size={20}
                    />
                    <p className="text-sm text-blue-800">
                      You must agree to all consent statements
                      and provide your signature before
                      proceeding to the survey.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Demographics Section */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-gray-700"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="age"
                    className="block mb-2 text-gray-700"
                  >
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ethnicity"
                    className="block mb-2 text-gray-700"
                  >
                    Ethnicity
                  </label>
                  <select
                    id="ethnicity"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="white-british">
                      White British
                    </option>
                    <option value="white-irish">
                      White Irish
                    </option>
                    <option value="white-gypsy">
                      White Gypsy or Irish Traveller
                    </option>
                    <option value="white-other">
                      White Other
                    </option>
                    <option value="mixed-white-black-caribbean">
                      Mixed White and Black Caribbean
                    </option>
                    <option value="mixed-white-black-african">
                      Mixed White and Black African
                    </option>
                    <option value="mixed-white-asian">
                      Mixed White and Asian
                    </option>
                    <option value="mixed-other">
                      Mixed Other
                    </option>
                    <option value="asian-indian">
                      Asian - Indian
                    </option>
                    <option value="asian-pakistani">
                      Asian - Pakistani
                    </option>
                    <option value="asian-bangladeshi">
                      Asian - Bangladeshi
                    </option>
                    <option value="asian-chinese">
                      Asian - Chinese
                    </option>
                    <option value="asian-other">
                      Asian Other
                    </option>
                    <option value="black-african">
                      Black African
                    </option>
                    <option value="black-caribbean">
                      Black Caribbean
                    </option>
                    <option value="black-other">
                      Black Other
                    </option>
                    <option value="arab">Arab</option>
                    <option value="other">Other</option>
                    <option value="prefer-not">
                      Prefer not to answer
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* PCOS Diagnosis Section */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="diagnosisAge"
                    className="block mb-2 text-gray-700"
                  >
                    At what age were you diagnosed with PCOS? *
                  </label>
                  <input
                    type="number"
                    id="diagnosisAge"
                    name="diagnosisAge"
                    value={formData.diagnosisAge}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Age at diagnosis"
                  />
                </div>

                <div>
                  <label
                    htmlFor="diagnosedBy"
                    className="block mb-2 text-gray-700"
                  >
                    Who diagnosed your PCOS?
                  </label>
                  <select
                    id="diagnosedBy"
                    name="diagnosedBy"
                    value={formData.diagnosedBy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="gp">
                      GP (General Practitioner)
                    </option>
                    <option value="endocrinologist">
                      Endocrinologist
                    </option>
                    <option value="gynecologist">
                      Gynecologist
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.diagnosedBy === "other" && (
                  <div>
                    <label
                      htmlFor="diagnosedByOther"
                      className="block mb-2 text-gray-700"
                    >
                      Please specify
                    </label>
                    <input
                      type="text"
                      id="diagnosedByOther"
                      name="diagnosedByOther"
                      value={formData.diagnosedByOther}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      placeholder="Please specify who diagnosed your PCOS"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="diagnosisExperience"
                    className="block mb-2 text-gray-700"
                  >
                    Tell us about your diagnosis experience
                  </label>
                  <textarea
                    id="diagnosisExperience"
                    name="diagnosisExperience"
                    value={formData.diagnosisExperience}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    placeholder="Please share your diagnosis experience..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="diagnosisMethod"
                    className="block mb-2 text-gray-700"
                  >
                    How was PCOS diagnosed?
                  </label>
                  <select
                    id="diagnosisMethod"
                    name="diagnosisMethod"
                    value={formData.diagnosisMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="ultrasound">
                      Ultrasound
                    </option>
                    <option value="blood-test">
                      Blood Test (Hormone Levels)
                    </option>
                    <option value="both">
                      Both Ultrasound and Blood Test
                    </option>
                    <option value="clinical">
                      Clinical Symptoms Only
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    Which symptoms led to your diagnosis?
                    (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {[
                      "Irregular or absent periods",
                      "Excess facial or body hair",
                      "Acne",
                      "Weight gain or difficulty losing weight",
                      "Thinning hair on scalp",
                      "Darkening of skin",
                      "Difficulty getting pregnant",
                      "Multiple ovarian cysts on ultrasound",
                    ].map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.symptoms.includes(
                            symptom,
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "symptoms",
                              symptom,
                            )
                          }
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                        />
                        <span className="text-gray-700">
                          {symptom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Digital App Usage Section */}
            {currentSection === 4 && (
              <div className="space-y-6">
                {/* NHS App */}
                <div>
                  <label
                    htmlFor="usesNHSApp"
                    className="block mb-2 text-gray-700"
                  >
                    Do you use the NHS app?
                  </label>
                  <select
                    id="usesNHSApp"
                    name="usesNHSApp"
                    value={formData.usesNHSApp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.usesNHSApp === "yes" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-3 text-gray-700">
                        What do you use the NHS app for? (Select
                        all that apply)
                      </label>
                      <div className="space-y-2">
                        {[
                          "View medical records",
                          "Order prescriptions",
                          "Book appointments",
                          "Access test results",
                          "Manage repeat prescriptions",
                          "Send messages to GP",
                          "Other",
                        ].map((feature) => (
                          <label
                            key={feature}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.nhsAppFeatures.includes(
                                feature,
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  "nhsAppFeatures",
                                  feature,
                                )
                              }
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                            />
                            <span className="text-gray-700">
                              {feature}
                            </span>
                          </label>
                        ))}
                      </div>
                      {formData.nhsAppFeatures.includes(
                        "Other",
                      ) && (
                        <div className="ml-4">
                          <input
                            type="text"
                            name="nhsAppOther"
                            value={formData.nhsAppOther}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                            placeholder="Please specify other NHS app usage"
                          />
                        </div>
                      )}
                    </div>

                    {formData.nhsAppFeatures.length > 0 && (
                      <>
                        <div>
                          <label
                            htmlFor="nhsAppLikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you like about the NHS app?
                          </label>
                          <textarea
                            id="nhsAppLikes"
                            name="nhsAppLikes"
                            value={formData.nhsAppLikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you like about the NHS app..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.nhsAppLikes.length}/500
                            characters
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="nhsAppDislikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you dislike about the NHS
                            app?
                          </label>
                          <textarea
                            id="nhsAppDislikes"
                            name="nhsAppDislikes"
                            value={formData.nhsAppDislikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you dislike about the NHS app..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.nhsAppDislikes.length}/500
                            characters
                          </p>
                        </div>

                        <div>
                          <label className="block mb-4 text-gray-700">
                            How well does the NHS app work for
                            you?
                          </label>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {[
                              {
                                value: "works-very-well",
                                label: "Works very well",
                                emoji: "😊",
                              },
                              {
                                value: "works-well",
                                label: "Works well",
                                emoji: "🙂",
                              },
                              {
                                value: "neutral",
                                label: "Neutral",
                                emoji: "😐",
                              },
                              {
                                value: "doesnt-work-well",
                                label: "Doesn't work well",
                                emoji: "🙁",
                              },
                              {
                                value: "doesnt-work",
                                label: "Doesn't work",
                                emoji: "😞",
                              },
                            ].map((option) => (
                              <label
                                key={option.value}
                                className="flex-shrink-0"
                              >
                                <input
                                  type="radio"
                                  name="nhsAppRating"
                                  value={option.value}
                                  checked={
                                    formData.nhsAppRating ===
                                    option.value
                                  }
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      nhsAppRating:
                                        e.target.value,
                                    })
                                  }
                                  className="peer sr-only"
                                />
                                <div className="w-[90px] sm:w-auto px-3 py-2 text-sm text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400 flex flex-col items-center gap-1">
                                  <span className="text-2xl">
                                    {option.emoji}
                                  </span>
                                  <span className="leading-tight">
                                    {option.label}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Period Tracker App */}
                <div>
                  <label
                    htmlFor="usesPeriodTracker"
                    className="block mb-2 text-gray-700"
                  >
                    Do you use a period tracker app?
                  </label>
                  <select
                    id="usesPeriodTracker"
                    name="usesPeriodTracker"
                    value={formData.usesPeriodTracker}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.usesPeriodTracker === "yes" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-3 text-gray-700">
                        What one? (Select all that apply)
                      </label>
                      <div className="space-y-2">
                        {[
                          "Flo",
                          "Clue",
                          "Period Tracker by GP Apps",
                          "Eve by Glow",
                          "My Calendar",
                          "Ovia",
                          "Natural Cycles",
                          "Other",
                        ].map((app) => (
                          <label
                            key={app}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.periodTrackerApps.includes(
                                app,
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  "periodTrackerApps",
                                  app,
                                )
                              }
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                            />
                            <span className="text-gray-700">
                              {app}
                            </span>
                          </label>
                        ))}
                      </div>
                      {formData.periodTrackerApps.includes(
                        "Other",
                      ) && (
                        <div className="ml-4">
                          <input
                            type="text"
                            name="periodTrackerOther"
                            value={formData.periodTrackerOther}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                            placeholder="Please specify other period tracker app"
                          />
                        </div>
                      )}
                    </div>

                    {formData.periodTrackerApps.length > 0 && (
                      <>
                        <div>
                          <label
                            htmlFor="periodTrackerLikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you like about the apps you
                            use?
                          </label>
                          <textarea
                            id="periodTrackerLikes"
                            name="periodTrackerLikes"
                            value={formData.periodTrackerLikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you like about the period tracker apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.periodTrackerLikes.length}
                            /500 characters
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="periodTrackerDislikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you dislike about the apps
                            you use?
                          </label>
                          <textarea
                            id="periodTrackerDislikes"
                            name="periodTrackerDislikes"
                            value={
                              formData.periodTrackerDislikes
                            }
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you dislike about the period tracker apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {
                              formData.periodTrackerDislikes
                                .length
                            }
                            /500 characters
                          </p>
                        </div>

                        {/* Period Tracker App Rankings */}
                        {formData.periodTrackerApps.length >
                          1 && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                            <label className="block mb-3 text-gray-700">
                              Please rank the period tracker
                              apps you selected in order of
                              usage (1 = most used)
                            </label>
                            <div className="space-y-3">
                              {formData.periodTrackerApps.map(
                                (app) => {
                                  const displayName =
                                    app === "Other" &&
                                    formData.periodTrackerOther
                                      ? formData.periodTrackerOther
                                      : app;
                                  const usedRanks =
                                    Object.entries(
                                      formData.periodTrackerRankings,
                                    )
                                      .filter(
                                        ([appName, _]) =>
                                          appName !== app,
                                      )
                                      .map(([_, rank]) => rank);
                                  return (
                                    <div
                                      key={app}
                                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white p-3 rounded-lg"
                                    >
                                      <span className="text-gray-700 sm:flex-1">
                                        {displayName}
                                      </span>
                                      <select
                                        value={
                                          formData
                                            .periodTrackerRankings[
                                            app
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleAppRankingChange(
                                            app,
                                            e.target.value,
                                            "periodTrackerRankings",
                                          )
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 w-full sm:w-auto sm:min-w-[200px]"
                                      >
                                        <option value="">
                                          {formData
                                            .periodTrackerRankings[
                                            app
                                          ]
                                            ? "Re-select rank..."
                                            : "Select rank..."}
                                        </option>
                                        {Array.from(
                                          {
                                            length:
                                              formData
                                                .periodTrackerApps
                                                .length,
                                          },
                                          (_, i) => i + 1,
                                        ).map((rank) => {
                                          const rankStr =
                                            rank.toString();
                                          const isUsed =
                                            usedRanks.includes(
                                              rankStr,
                                            );
                                          return (
                                            <option
                                              key={rank}
                                              value={rankStr}
                                              disabled={isUsed}
                                            >
                                              {rank}
                                              {isUsed
                                                ? " (already used)"
                                                : ""}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}

                        {/* Period Tracker App Effectiveness */}
                        {formData.periodTrackerApps.length >
                          0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <label className="block mb-4 text-gray-700">
                              How well does each app work for
                              you?
                            </label>
                            <div className="space-y-4">
                              {formData.periodTrackerApps.map(
                                (app) => {
                                  const displayName =
                                    app === "Other" &&
                                    formData.periodTrackerOther
                                      ? formData.periodTrackerOther
                                      : app;
                                  return (
                                    <div
                                      key={app}
                                      className="bg-white p-4 rounded-lg"
                                    >
                                      <div className="mb-3">
                                        <span className="text-gray-700">
                                          {displayName}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                                        {[
                                          {
                                            value:
                                              "works-very-well",
                                            emoji: "😊",
                                            label:
                                              "Works Very Well",
                                          },
                                          {
                                            value: "works-well",
                                            emoji: "🙂",
                                            label: "Works Well",
                                          },
                                          {
                                            value: "neutral",
                                            emoji: "😐",
                                            label: "Neutral",
                                          },
                                          {
                                            value:
                                              "doesnt-work-well",
                                            emoji: "🙁",
                                            label:
                                              "Doesn't Work Well",
                                          },
                                          {
                                            value:
                                              "doesnt-work",
                                            emoji: "😞",
                                            label:
                                              "Doesn't Work",
                                          },
                                        ].map((option) => {
                                          const isSelected =
                                            formData
                                              .periodTrackerEffectiveness[
                                              app
                                            ] === option.value;
                                          return (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onClick={() =>
                                                handleAppEffectivenessChange(
                                                  app,
                                                  option.value,
                                                  "periodTrackerEffectiveness",
                                                )
                                              }
                                              className={`w-[60px] h-[85px] sm:w-[80px] sm:h-[95px] flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                                isSelected
                                                  ? "border-teal-600 bg-teal-50"
                                                  : "border-gray-200 hover:border-gray-300 bg-white"
                                              }`}
                                            >
                                              <span className="text-2xl">
                                                {option.emoji}
                                              </span>
                                              <span
                                                className={`text-xs text-center leading-tight ${isSelected ? "text-teal-700" : "text-gray-600"}`}
                                              >
                                                {option.label}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Nutrition/Weight Management App */}
                <div>
                  <label
                    htmlFor="usesNutritionApp"
                    className="block mb-2 text-gray-700"
                  >
                    Do you use a nutrition/weight management
                    app?
                  </label>
                  <select
                    id="usesNutritionApp"
                    name="usesNutritionApp"
                    value={formData.usesNutritionApp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.usesNutritionApp === "yes" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-3 text-gray-700">
                        Which one(s)? (Select all that apply)
                      </label>
                      <div className="space-y-2">
                        {[
                          "MyFitnessPal",
                          "Lose It!",
                          "Noom",
                          "WW (Weight Watchers)",
                          "Cronometer",
                          "Lifesum",
                          "Yazio",
                          "Other",
                        ].map((app) => (
                          <label
                            key={app}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.nutritionApps.includes(
                                app,
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  "nutritionApps",
                                  app,
                                )
                              }
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                            />
                            <span className="text-gray-700">
                              {app}
                            </span>
                          </label>
                        ))}
                      </div>
                      {formData.nutritionApps.includes(
                        "Other",
                      ) && (
                        <div className="ml-4">
                          <input
                            type="text"
                            name="nutritionAppOther"
                            value={formData.nutritionAppOther}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                            placeholder="Please specify other nutrition/weight management app"
                          />
                        </div>
                      )}
                    </div>

                    {formData.nutritionApps.length > 0 && (
                      <>
                        <div>
                          <label
                            htmlFor="nutritionAppLikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you like about the apps you
                            use?
                          </label>
                          <textarea
                            id="nutritionAppLikes"
                            name="nutritionAppLikes"
                            value={formData.nutritionAppLikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you like about the nutrition/weight management apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.nutritionAppLikes.length}
                            /500 characters
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="nutritionAppDislikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you dislike about the apps
                            you use?
                          </label>
                          <textarea
                            id="nutritionAppDislikes"
                            name="nutritionAppDislikes"
                            value={
                              formData.nutritionAppDislikes
                            }
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you dislike about the nutrition/weight management apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {
                              formData.nutritionAppDislikes
                                .length
                            }
                            /500 characters
                          </p>
                        </div>

                        {/* Nutrition App Rankings */}
                        {formData.nutritionApps.length > 1 && (
                          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                            <label className="block mb-3 text-gray-700">
                              Please rank the nutrition/weight
                              management apps you selected in
                              order of usage (1 = most used)
                            </label>
                            <div className="space-y-3">
                              {formData.nutritionApps.map(
                                (app) => {
                                  const displayName =
                                    app === "Other" &&
                                    formData.nutritionAppOther
                                      ? formData.nutritionAppOther
                                      : app;
                                  const usedRanks =
                                    Object.entries(
                                      formData.nutritionAppRankings,
                                    )
                                      .filter(
                                        ([appName, _]) =>
                                          appName !== app,
                                      )
                                      .map(([_, rank]) => rank);
                                  return (
                                    <div
                                      key={app}
                                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white p-3 rounded-lg"
                                    >
                                      <span className="text-gray-700 sm:flex-1">
                                        {displayName}
                                      </span>
                                      <select
                                        value={
                                          formData
                                            .nutritionAppRankings[
                                            app
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleAppRankingChange(
                                            app,
                                            e.target.value,
                                            "nutritionAppRankings",
                                          )
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 w-full sm:w-auto sm:min-w-[200px]"
                                      >
                                        <option value="">
                                          {formData
                                            .nutritionAppRankings[
                                            app
                                          ]
                                            ? "Re-select rank..."
                                            : "Select rank..."}
                                        </option>
                                        {Array.from(
                                          {
                                            length:
                                              formData
                                                .nutritionApps
                                                .length,
                                          },
                                          (_, i) => i + 1,
                                        ).map((rank) => {
                                          const rankStr =
                                            rank.toString();
                                          const isUsed =
                                            usedRanks.includes(
                                              rankStr,
                                            );
                                          return (
                                            <option
                                              key={rank}
                                              value={rankStr}
                                              disabled={isUsed}
                                            >
                                              {rank}
                                              {isUsed
                                                ? " (already used)"
                                                : ""}
                                            </option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}

                        {/* Nutrition App Effectiveness */}
                        {formData.nutritionApps.length > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <label className="block mb-4 text-gray-700">
                              How well does each app work for
                              you?
                            </label>
                            <div className="space-y-4">
                              {formData.nutritionApps.map(
                                (app) => {
                                  const displayName =
                                    app === "Other" &&
                                    formData.nutritionAppOther
                                      ? formData.nutritionAppOther
                                      : app;
                                  return (
                                    <div
                                      key={app}
                                      className="bg-white p-4 rounded-lg"
                                    >
                                      <div className="mb-3">
                                        <span className="text-gray-700">
                                          {displayName}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                                        {[
                                          {
                                            value:
                                              "works-very-well",
                                            emoji: "😊",
                                            label:
                                              "Works Very Well",
                                          },
                                          {
                                            value: "works-well",
                                            emoji: "🙂",
                                            label: "Works Well",
                                          },
                                          {
                                            value: "neutral",
                                            emoji: "😐",
                                            label: "Neutral",
                                          },
                                          {
                                            value:
                                              "doesnt-work-well",
                                            emoji: "🙁",
                                            label:
                                              "Doesn't Work Well",
                                          },
                                          {
                                            value:
                                              "doesnt-work",
                                            emoji: "😞",
                                            label:
                                              "Doesn't Work",
                                          },
                                        ].map((option) => {
                                          const isSelected =
                                            formData
                                              .nutritionAppEffectiveness[
                                              app
                                            ] === option.value;
                                          return (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onClick={() =>
                                                handleAppEffectivenessChange(
                                                  app,
                                                  option.value,
                                                  "nutritionAppEffectiveness",
                                                )
                                              }
                                              className={`w-[60px] h-[85px] sm:w-[80px] sm:h-[95px] flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                                isSelected
                                                  ? "border-teal-600 bg-teal-50"
                                                  : "border-gray-200 hover:border-gray-300 bg-white"
                                              }`}
                                            >
                                              <span className="text-2xl">
                                                {option.emoji}
                                              </span>
                                              <span
                                                className={`text-xs text-center leading-tight ${isSelected ? "text-teal-700" : "text-gray-600"}`}
                                              >
                                                {option.label}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* PCOS Specific App */}
                <div>
                  <label
                    htmlFor="usesPCOSApp"
                    className="block mb-2 text-gray-700"
                  >
                    Do you use a PCOS specific app?
                  </label>
                  <select
                    id="usesPCOSApp"
                    name="usesPCOSApp"
                    value={formData.usesPCOSApp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.usesPCOSApp === "yes" && (
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="pcosAppName"
                        className="block mb-2 text-gray-700"
                      >
                        What one?
                      </label>
                      <input
                        type="text"
                        id="pcosAppName"
                        name="pcosAppName"
                        value={formData.pcosAppName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Please specify the PCOS app name"
                      />
                    </div>

                    {formData.pcosAppName && (
                      <>
                        <div>
                          <label
                            htmlFor="pcosAppLikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you like about the apps you
                            use?
                          </label>
                          <textarea
                            id="pcosAppLikes"
                            name="pcosAppLikes"
                            value={formData.pcosAppLikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you like about the PCOS apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.pcosAppLikes.length}/500
                            characters
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="pcosAppDislikes"
                            className="block mb-2 text-gray-700"
                          >
                            What do you dislike about the apps
                            you use?
                          </label>
                          <textarea
                            id="pcosAppDislikes"
                            name="pcosAppDislikes"
                            value={formData.pcosAppDislikes}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                            placeholder="Please share what you dislike about the PCOS apps..."
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formData.pcosAppDislikes.length}
                            /500 characters
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Digital Games Section */}
            {currentSection === 5 && (
              <div className="space-y-6">
                {/* Uses Games Question */}
                <div>
                  <label className="block mb-3 text-gray-700">
                    Do you use your mobile phone for games or
                    gamified activities?
                  </label>
                  <p className="text-sm text-gray-600 mb-4 italic">
                    Gamification means adding fun, game-like
                    features—such as points, badges, levels, or
                    rewards—to an app to make it more engaging
                    and motivating to use. If any apps you use
                    do this, please answer yes.
                  </p>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          const val = option.toLowerCase();
                          setFormData({
                            ...formData,
                            usesGames: val,
                            gameApps: val === "yes" && formData.gameApps.length === 0
                              ? [{ name: "", rating: "", frequency: "" }]
                              : formData.gameApps,
                          });
                        }}
                        className={`px-6 py-3 rounded-lg border transition-all ${
                          formData.usesGames === option.toLowerCase()
                            ? "bg-teal-600 text-white border-teal-600"
                            : "border-gray-300 text-gray-700 hover:border-teal-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Apps Section */}
                {formData.usesGames === "yes" && (
                  <>
                    <div>
                      <label className="block mb-3 text-gray-700">
                        Which game applications do you use?
                      </label>
                      <div className="space-y-4">
                        {formData.gameApps.map(
                          (game, index) => (
                            <div
                              key={index}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Game/App Name
                                  </label>
                                  <input
                                    type="text"
                                    value={game.name}
                                    onChange={(e) =>
                                      updateGameApp(
                                        index,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                                    placeholder="Enter game or app name"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    How well does this game app
                                    work for you?
                                  </label>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                      {
                                        value:
                                          "works-very-well",
                                        label:
                                          "Works very well",
                                        emoji: "😊",
                                      },
                                      {
                                        value: "works-well",
                                        label: "Works well",
                                        emoji: "🙂",
                                      },
                                      {
                                        value: "neutral",
                                        label: "Neutral",
                                        emoji: "😐",
                                      },
                                      {
                                        value:
                                          "doesnt-work-well",
                                        label:
                                          "Doesn't work well",
                                        emoji: "🙁",
                                      },
                                      {
                                        value: "doesnt-work",
                                        label: "Doesn't work",
                                        emoji: "😞",
                                      },
                                    ].map((option) => (
                                      <label
                                        key={option.value}
                                        className="flex-shrink-0"
                                      >
                                        <input
                                          type="radio"
                                          name={`game-rating-${index}`}
                                          value={option.value}
                                          checked={
                                            game.rating ===
                                            option.value
                                          }
                                          onChange={(e) =>
                                            updateGameApp(
                                              index,
                                              "rating",
                                              e.target.value,
                                            )
                                          }
                                          className="peer sr-only"
                                        />
                                        <div className="w-[90px] sm:w-auto px-3 py-2 text-sm text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400 flex flex-col items-center gap-1">
                                          <span className="text-2xl">
                                            {option.emoji}
                                          </span>
                                          <span className="leading-tight">
                                            {option.label}
                                          </span>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    How often do you engage with
                                    this game?
                                  </label>
                                  <select
                                    value={game.frequency}
                                    onChange={(e) =>
                                      updateGameApp(
                                        index,
                                        "frequency",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                                  >
                                    <option value="">
                                      Select frequency...
                                    </option>
                                    <option value="multiple-daily">
                                      Multiple times daily
                                    </option>
                                    <option value="daily">
                                      Daily
                                    </option>
                                    <option value="several-weekly">
                                      Several times a week
                                    </option>
                                    <option value="weekly">
                                      Weekly
                                    </option>
                                    <option value="monthly">
                                      Monthly
                                    </option>
                                    <option value="rarely">
                                      Rarely
                                    </option>
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeGameApp(index)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                                >
                                  <span>Remove this game</span>
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={addGameApp}
                        className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        + Add Another Game
                      </button>
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700">
                        What do you like about the games you
                        use?
                      </label>
                      <textarea
                        name="gameLikes"
                        value={formData.gameLikes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Share what you enjoy about these games..."
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700">
                        What do you dislike about the games you
                        use?
                      </label>
                      <textarea
                        name="gameDislikes"
                        value={formData.gameDislikes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Share any concerns or issues with these games..."
                      />
                    </div>
                  </>
                )}

                {/* Wearable Devices Section */}
                <div>
                  <label className="block mb-3 text-gray-700">
                    Do you use any wearable devices?
                  </label>
                  <div className="flex gap-4">
                    {["Yes", "No"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          const val = option.toLowerCase();
                          setFormData({
                            ...formData,
                            usesWearables: val,
                            wearableDevices: val === "yes" && formData.wearableDevices.length === 0
                              ? [{ name: "", brand: "", rating: "" }]
                              : formData.wearableDevices,
                          });
                        }}
                        className={`px-6 py-3 rounded-lg border transition-all ${
                          formData.usesWearables === option.toLowerCase()
                            ? "bg-teal-600 text-white border-teal-600"
                            : "border-gray-300 text-gray-700 hover:border-teal-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.usesWearables === "yes" && (
                  <>
                    <div>
                      <label className="block mb-3 text-gray-700">
                        Which wearable devices do you use?
                      </label>
                      <div className="space-y-4">
                        {formData.wearableDevices.map(
                          (device, index) => (
                            <div
                              key={index}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Device Name
                                  </label>
                                  <input
                                    type="text"
                                    value={device.name}
                                    onChange={(e) =>
                                      updateWearableDevice(
                                        index,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                                    placeholder="e.g., Fitbit, Apple Watch, etc."
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Brand
                                  </label>
                                  <input
                                    type="text"
                                    value={device.brand}
                                    onChange={(e) =>
                                      updateWearableDevice(
                                        index,
                                        "brand",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                                    placeholder="Enter device brand"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-2">
                                    How well does this device
                                    work for you?
                                  </label>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    {[
                                      {
                                        value:
                                          "works-very-well",
                                        label:
                                          "Works very well",
                                        emoji: "😊",
                                      },
                                      {
                                        value: "works-well",
                                        label: "Works well",
                                        emoji: "🙂",
                                      },
                                      {
                                        value: "neutral",
                                        label: "Neutral",
                                        emoji: "😐",
                                      },
                                      {
                                        value:
                                          "doesnt-work-well",
                                        label:
                                          "Doesn't work well",
                                        emoji: "🙁",
                                      },
                                      {
                                        value: "doesnt-work",
                                        label: "Doesn't work",
                                        emoji: "😞",
                                      },
                                    ].map((option) => (
                                      <label
                                        key={option.value}
                                        className="flex-shrink-0"
                                      >
                                        <input
                                          type="radio"
                                          name={`device-rating-${index}`}
                                          value={option.value}
                                          checked={
                                            device.rating ===
                                            option.value
                                          }
                                          onChange={(e) =>
                                            updateWearableDevice(
                                              index,
                                              "rating",
                                              e.target.value,
                                            )
                                          }
                                          className="peer sr-only"
                                        />
                                        <div className="w-[90px] sm:w-auto px-3 py-2 text-sm text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400 flex flex-col items-center gap-1">
                                          <span className="text-2xl">
                                            {option.emoji}
                                          </span>
                                          <span className="leading-tight">
                                            {option.label}
                                          </span>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeWearableDevice(index)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                                >
                                  <span>
                                    Remove this device
                                  </span>
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={addWearableDevice}
                        className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        + Add Another Device
                      </button>
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700">
                        What do you like about the devices you
                        use?
                      </label>
                      <textarea
                        name="wearableLikes"
                        value={formData.wearableLikes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Share what you enjoy about these devices..."
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700">
                        What do you dislike about the devices
                        you use?
                      </label>
                      <textarea
                        name="wearableDislikes"
                        value={formData.wearableDislikes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Share any concerns or issues with these devices..."
                      />
                    </div>
                  </>
                )}

                {/* Gamification Interest */}
                <div>
                  <label className="block mb-3 text-gray-700">
                    How would you rate creating games /
                    gamifications around your PCOS care?
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      {
                        value: "wonderful",
                        label: "Wonderful",
                      },
                      {
                        value: "could-be-interesting",
                        label: "Could be interesting",
                      },
                      { value: "neutral", label: "Neutral" },
                      {
                        value: "not-interested",
                        label: "Not interested",
                      },
                      { value: "no-way", label: "No way" },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="gamificationInterest"
                          value={option.value}
                          checked={
                            formData.gamificationInterest ===
                            option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 min-w-[140px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medical History Section */}
            {currentSection === 6 && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-3 text-gray-700">
                    What treatments have you tried for PCOS?
                    (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {[
                      "Birth control pills",
                      "Metformin",
                      "Spironolactone",
                      "Clomid/Clomiphene",
                      "Letrozole",
                      "Lifestyle changes (diet/exercise)",
                      "Supplements (e.g., Inositol)",
                      "Other hormonal medications",
                      "No treatment yet",
                    ].map((treatment) => (
                      <label
                        key={treatment}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.previousTreatments.includes(
                            treatment,
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "previousTreatments",
                              treatment,
                            )
                          }
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                        />
                        <span className="text-gray-700">
                          {treatment}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="otherConditions"
                    className="block mb-2 text-gray-700"
                  >
                    Other Health Conditions
                  </label>
                  <textarea
                    id="otherConditions"
                    name="otherConditions"
                    value={formData.otherConditions}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    placeholder="e.g., diabetes, thyroid issues, etc..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="familyHistory"
                    className="block mb-2 text-gray-700"
                  >
                    Family History of PCOS or Related Conditions
                  </label>
                  <textarea
                    id="familyHistory"
                    name="familyHistory"
                    value={formData.familyHistory}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    placeholder="Describe any family history..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="hasBeenPregnant"
                    className="block mb-2 text-gray-700"
                  >
                    Have you ever been pregnant?
                  </label>
                  <select
                    id="hasBeenPregnant"
                    name="hasBeenPregnant"
                    value={formData.hasBeenPregnant}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.hasBeenPregnant === "yes" && (
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="usedIVF"
                        className="block mb-2 text-gray-700"
                      >
                        Did you use IVF (In Vitro
                        Fertilization)?
                      </label>
                      <select
                        id="usedIVF"
                        name="usedIVF"
                        value={formData.usedIVF}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="timeToPregnancy"
                        className="block mb-2 text-gray-700"
                      >
                        How long did it take to get pregnant?
                      </label>
                      <select
                        id="timeToPregnancy"
                        name="timeToPregnancy"
                        value={formData.timeToPregnancy}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        <option value="">Select...</option>
                        <option value="less-than-6">
                          Less than 6 months
                        </option>
                        <option value="6-12">
                          6-12 months
                        </option>
                        <option value="1-2-years">
                          1-2 years
                        </option>
                        <option value="more-than-2">
                          More than 2 years
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lifestyle Factors Section */}
            {currentSection === 7 && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-3 text-gray-700">
                    How often do you exercise?
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { value: "never", label: "Never" },
                      { value: "rarely", label: "Rarely" },
                      { value: "once", label: "1x/week" },
                      {
                        value: "2-3-times",
                        label: "2-3x/week",
                      },
                      {
                        value: "4-6-times",
                        label: "4-6x/week",
                      },
                      { value: "daily", label: "Daily" },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="exerciseFrequency"
                          value={option.value}
                          checked={
                            formData.exerciseFrequency ===
                            option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 w-[140px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    How would you describe your diet?
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { value: "balanced", label: "Balanced" },
                      { value: "low-carb", label: "Low-carb" },
                      { value: "keto", label: "Keto" },
                      {
                        value: "mediterranean",
                        label: "Mediterranean",
                      },
                      {
                        value: "vegetarian",
                        label: "Vegetarian",
                      },
                      { value: "vegan", label: "Vegan" },
                      {
                        value: "gluten-free",
                        label: "Gluten-free",
                      },
                      {
                        value: "no-specific",
                        label: "No specific diet",
                      },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="dietType"
                          value={option.value}
                          checked={
                            formData.dietType === option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 w-[140px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    Average hours of sleep per night
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      {
                        value: "less-than-5",
                        label: "Less than 5 hours",
                      },
                      { value: "5-6", label: "5-6 hours" },
                      { value: "7-8", label: "7-8 hours" },
                      {
                        value: "more-than-8",
                        label: "More than 8 hours",
                      },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="sleepHours"
                          value={option.value}
                          checked={
                            formData.sleepHours === option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 w-[180px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    What vitamins or supplements do you take?
                    (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {[
                      "Vitamin D",
                      "Vitamin B12",
                      "Vitamin C",
                      "Folic Acid",
                      "Iron",
                      "Calcium",
                      "Magnesium",
                      "Omega-3/Fish Oil",
                      "Zinc",
                      "Probiotics",
                      "Multivitamin",
                      "Inositol",
                      "NAC (N-Acetyl Cysteine)",
                      "Other",
                      "None",
                    ].map((vitamin) => (
                      <label
                        key={vitamin}
                        className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer ${formData.vitamins.includes("None") && vitamin !== "None" ? "opacity-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.vitamins.includes(
                            vitamin,
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "vitamins",
                              vitamin,
                            )
                          }
                          disabled={
                            formData.vitamins.includes(
                              "None",
                            ) && vitamin !== "None"
                          }
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-gray-700">
                          {vitamin}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.vitamins.includes("Other") && (
                    <div className="mt-3">
                      <input
                        type="text"
                        name="vitaminsOther"
                        value={formData.vitaminsOther}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Please specify other vitamins or supplements"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    How much time do you spend on social media?
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      {
                        value: "less-than-1",
                        label: "Less than 1 hour",
                      },
                      { value: "1-2", label: "1-2 hours" },
                      { value: "3-4", label: "3-4 hours" },
                      {
                        value: "more-than-4",
                        label: "More than 4 hours",
                      },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="socialMediaTime"
                          value={option.value}
                          checked={
                            formData.socialMediaTime ===
                            option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 w-[180px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-3 text-gray-700">
                    What social media networks do you use?
                    (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {[
                      "Facebook",
                      "Instagram",
                      "Twitter/X",
                      "TikTok",
                      "LinkedIn",
                      "YouTube",
                      "Snapchat",
                      "Pinterest",
                      "Reddit",
                      "WhatsApp",
                      "Other",
                    ].map((network) => (
                      <label
                        key={network}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.socialMediaNetworks.includes(
                            network,
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              "socialMediaNetworks",
                              network,
                            )
                          }
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                        />
                        <span className="text-gray-700">
                          {network}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.socialMediaNetworks.includes(
                    "Other",
                  ) && (
                    <div className="mt-3">
                      <input
                        type="text"
                        name="socialMediaOther"
                        value={formData.socialMediaOther}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        placeholder="Please specify other social media network"
                      />
                    </div>
                  )}
                </div>

                {formData.socialMediaNetworks.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <label className="block mb-3 text-gray-700">
                      Please rank the social media networks you
                      selected in order of usage (1 = most used)
                    </label>
                    <div className="space-y-3">
                      {formData.socialMediaNetworks.map(
                        (network) => {
                          const displayName =
                            network === "Other" &&
                            formData.socialMediaOther
                              ? formData.socialMediaOther
                              : network;
                          const usedRanks = Object.entries(
                            formData.socialMediaRankings,
                          )
                            .filter(
                              ([net, _]) => net !== network,
                            )
                            .map(([_, rank]) => rank);
                          return (
                            <div
                              key={network}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white p-3 rounded-lg"
                            >
                              <span className="text-gray-700 sm:flex-1">
                                {displayName}
                              </span>
                              <select
                                value={
                                  formData.socialMediaRankings[
                                    network
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleRankingChange(
                                    network,
                                    e.target.value,
                                  )
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 w-full sm:w-auto sm:min-w-[200px]"
                              >
                                <option value="">
                                  {formData.socialMediaRankings[
                                    network
                                  ]
                                    ? "Re-select rank..."
                                    : "Select rank..."}
                                </option>
                                {Array.from(
                                  {
                                    length:
                                      formData
                                        .socialMediaNetworks
                                        .length,
                                  },
                                  (_, i) => i + 1,
                                ).map((rank) => {
                                  const rankStr =
                                    rank.toString();
                                  const isUsed =
                                    usedRanks.includes(rankStr);
                                  return (
                                    <option
                                      key={rank}
                                      value={rankStr}
                                      disabled={isUsed}
                                    >
                                      {rank}
                                      {isUsed
                                        ? " (already used)"
                                        : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-3 text-gray-700">
                    How would you rate your overall stress
                    level?
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { value: "very-low", label: "Very Low" },
                      { value: "low", label: "Low" },
                      { value: "moderate", label: "Moderate" },
                      { value: "high", label: "High" },
                      {
                        value: "very-high",
                        label: "Very High",
                      },
                    ].map((option) => (
                      <label key={option.value}>
                        <input
                          type="radio"
                          name="stressLevel"
                          value={option.value}
                          checked={
                            formData.stressLevel ===
                            option.value
                          }
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="p-3 w-[140px] text-center border border-gray-300 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600 hover:border-teal-400">
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quality of Life Section */}
            {currentSection === 3 && (
              <div className="space-y-8">
                {/* Physical Well-being */}
                <div>
                  <label className="block mb-4 text-gray-700">
                    How would you rate your physical well-being?
                  </label>
                  <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 max-w-2xl">
                    {[
                      {
                        value: "excellent",
                        emoji: "😄",
                        label: "Excellent",
                        color: "green",
                      },
                      {
                        value: "very-good",
                        emoji: "🙂",
                        label: "Very Good",
                        color: "lime",
                      },
                      {
                        value: "good",
                        emoji: "😐",
                        label: "Good",
                        color: "yellow",
                      },
                      {
                        value: "fair",
                        emoji: "😕",
                        label: "Fair",
                        color: "orange",
                      },
                      {
                        value: "poor",
                        emoji: "😢",
                        label: "Poor",
                        color: "red",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            physicalWellbeing: option.value,
                          })
                        }
                        className={`w-[65px] h-[95px] sm:w-[95px] sm:h-[110px] flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.physicalWellbeing ===
                          option.value
                            ? "border-teal-600 bg-teal-50 shadow-lg scale-105"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl mb-2">
                          {option.emoji}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 leading-tight">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotional Well-being */}
                <div>
                  <label className="block mb-4 text-gray-700">
                    How would you rate your emotional
                    well-being?
                  </label>
                  <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 max-w-2xl">
                    {[
                      {
                        value: "excellent",
                        emoji: "😄",
                        label: "Excellent",
                        color: "green",
                      },
                      {
                        value: "very-good",
                        emoji: "🙂",
                        label: "Very Good",
                        color: "lime",
                      },
                      {
                        value: "good",
                        emoji: "😐",
                        label: "Good",
                        color: "yellow",
                      },
                      {
                        value: "fair",
                        emoji: "😕",
                        label: "Fair",
                        color: "orange",
                      },
                      {
                        value: "poor",
                        emoji: "😢",
                        label: "Poor",
                        color: "red",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            emotionalWellbeing: option.value,
                          })
                        }
                        className={`w-[65px] h-[95px] sm:w-[95px] sm:h-[110px] flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.emotionalWellbeing ===
                          option.value
                            ? "border-teal-600 bg-teal-50 shadow-lg scale-105"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl mb-2">
                          {option.emoji}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 leading-tight">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Impact */}
                <div>
                  <label className="block mb-4 text-gray-700">
                    How much does PCOS impact your social life?
                  </label>
                  <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 max-w-2xl">
                    {[
                      {
                        value: "not-at-all",
                        emoji: "😊",
                        label: "Not at all",
                        color: "green",
                      },
                      {
                        value: "slightly",
                        emoji: "🙂",
                        label: "Slightly",
                        color: "lime",
                      },
                      {
                        value: "moderately",
                        emoji: "😐",
                        label: "Moderately",
                        color: "yellow",
                      },
                      {
                        value: "significantly",
                        emoji: "😟",
                        label: "Significantly",
                        color: "orange",
                      },
                      {
                        value: "severely",
                        emoji: "😢",
                        label: "Severely",
                        color: "red",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socialImpact: option.value,
                          })
                        }
                        className={`w-[65px] h-[95px] sm:w-[95px] sm:h-[110px] flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.socialImpact === option.value
                            ? "border-teal-600 bg-teal-50 shadow-lg scale-105"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="text-3xl sm:text-4xl mb-2">
                          {option.emoji}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 leading-tight">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Section */}
            {currentSection === 8 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="additionalComments"
                    className="block mb-2 text-gray-700"
                  >
                    Is there anything else you'd like to share
                    about your PCOS experience?
                  </label>
                  <textarea
                    id="additionalComments"
                    name="additionalComments"
                    value={formData.additionalComments}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    placeholder="Share any additional thoughts, experiences, or information that you feel is relevant to your PCOS journey..."
                  />
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                  <div className="flex gap-3">
                    <CheckCircle2
                      className="text-teal-600 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h3 className="text-teal-900 mb-2">
                        Thank You!
                      </h3>
                      <p className="text-teal-800">
                        Your responses will contribute to
                        important research on PCOS. By clicking
                        "Submit Survey" below, you confirm that
                        all information provided is accurate to
                        the best of your knowledge and you
                        consent to its use in research studies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={prevSection}
                disabled={currentSection === 0}
                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  currentSection === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="text-gray-600 text-sm sm:text-base order-first sm:order-none">
                Step {currentSection + 1} of {sections.length}
              </div>

              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  onClick={nextSection}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : "Submit Survey"}
                </button>
              )}
            </div>
            {submitError && (
              <p className="mt-3 text-sm text-red-600 text-center">
                {submitError}
              </p>
            )}
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="bg-gray-100 rounded-lg p-6 mt-8">
          <h3 className="mb-3">Privacy & Confidentiality</h3>
          <p className="text-gray-600 mb-3">
            All information collected in this survey is strictly
            confidential and will be used solely for research
            purposes. Your data will be anonymized and stored
            securely in compliance with data protection
            regulations.
          </p>
          <p className="text-gray-600">
            For questions about this survey or the research
            study, please contact our research team through the
            contact form on our website.
          </p>
        </div>
      </div>
    </div>
  );
}