// =============================================================================
// BlogPage.tsx
// Version: 2.5.5
// Last updated: 2026-05-01
//
// CHANGELOG
// v2.5.5 (2026-05-01)
//   - FIXED: HTML entities showing as raw codes (&#8217; etc) in post text.
//     Root cause: stripHtml removed tags but left encoded entities intact.
//     Fix: decode via a temporary textarea DOM element after stripping tags —
//     the browser's own HTML parser converts all entities to proper characters.
//
// v2.4.9 - v2.5.1: incremental fixes (see git history)
// v2.0.0 (2026-04-29): full redesign — timeline feed, accordion cards
// v1.0.0 (2026-04-10): initial static blog page
// =============================================================================

import { useState, useEffect } from 'react';
import { Rss, ChevronDown, ChevronUp, ExternalLink, Mail } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import blogHeaderImg from '../assets/blog-header.jpg';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------
interface SubstackPost {
  title: string;
  excerpt: string;
  displayDate: string;
  link: string;
  thumbnail: string;
}

// -----------------------------------------------------------------------------
// COLOUR BLOCKS — cycle through teal shades when no thumbnail available
// -----------------------------------------------------------------------------
const COLOUR_BLOCKS = ['bg-teal-600', 'bg-teal-700', 'bg-teal-500', 'bg-teal-800'];

// -----------------------------------------------------------------------------
// FALLBACK POSTS — shown only when all RSS fetch attempts fail
// -----------------------------------------------------------------------------
const FALLBACK_POSTS: SubstackPost[] = [
  {
    title: 'Why PCOS Diagnosis Takes So Long — and What We Can Do About It',
    excerpt: 'The average time from first symptoms to diagnosis is over two years. I explore the systemic, cultural, and clinical reasons behind this delay and what patient-centred design could offer.',
    displayDate: '28 March 2026',
    link: 'https://hbwray.substack.com',
    thumbnail: '',
  },
  {
    title: 'Flo, Clue, and the Period Tracker Problem: What Apps Get Wrong',
    excerpt: 'Period-tracking apps collect enormous amounts of intimate data, yet most still present PCOS as an afterthought. I look at where UX design is failing women with hormonal conditions.',
    displayDate: '10 March 2026',
    link: 'https://hbwray.substack.com',
    thumbnail: '',
  },
  {
    title: 'What Self-Management Actually Means When You Have PCOS',
    excerpt: 'The phrase "lifestyle management" is used constantly in PCOS care — but what does it mean in practice? Drawing from survey responses, I unpack the emotional labour behind the advice.',
    displayDate: '18 February 2026',
    link: 'https://hbwray.substack.com',
    thumbnail: '',
  },
  {
    title: 'Co-Design in Healthcare: Involving Patients in Building Better Tools',
    excerpt: 'Co-design is a methodology with real implications for how digital health tools are built and evaluated. Here I outline my approach and early findings.',
    displayDate: '30 January 2026',
    link: 'https://hbwray.substack.com',
    thumbnail: '',
  },
];

// -----------------------------------------------------------------------------
// RSS HELPERS
// -----------------------------------------------------------------------------
const SUBSTACK_RSS = 'https://hbwray.substack.com/feed';
const SELF_PROXY_URL = 'https://pcosphd.coventry.domains/rss-proxy.php';

function stripHtml(html: string): string {
  // Remove HTML tags first
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  // Decode HTML entities using a temporary DOM element
  const txt = document.createElement('textarea');
  txt.innerHTML = stripped;
  return txt.value;
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function truncate(text: string, max = 800): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)) + '...';
}

function parseRssXml(xml: string): SubstackPost[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  if (!items.length) throw new Error('no items');
  return items.map(item => {
    const enclosure = item.querySelector('enclosure');
    const media = item.querySelector('content');
    const thumbnail = enclosure?.getAttribute('url') || media?.getAttribute('url') || '';

    // Prefer content:encoded (full article HTML) over description (short excerpt)
    // Substack puts the full post body in content:encoded
    const ns = doc.createNSResolver(doc.documentElement);
    const contentEncoded = item.getElementsByTagNameNS('*', 'encoded')[0]?.textContent
      || item.querySelector('content\\:encoded')?.textContent
      || item.querySelector('description')?.textContent
      || '';

    return {
      title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
      excerpt: truncate(stripHtml(contentEncoded)),
      displayDate: formatDate(item.querySelector('pubDate')?.textContent || ''),
      link: item.querySelector('link')?.textContent?.trim() || 'https://hbwray.substack.com',
      thumbnail,
    };
  });
}

// Tier 1 — own PHP proxy (works on coventry.domains if file_get_contents enabled)
async function fetchViaSelfProxy(): Promise<SubstackPost[]> {
  const res = await fetch(SELF_PROXY_URL);
  if (!res.ok) throw new Error(`self-proxy ${res.status}`);
  const data = await res.json();
  if (data.error || !data.items?.length) throw new Error('self-proxy empty');
  return data.items.map((item: any) => ({
    title: item.title || 'Untitled',
    excerpt: truncate(stripHtml(item.content || item.description || '')),
    displayDate: formatDate(item.pubDate),
    link: item.link || 'https://hbwray.substack.com',
    thumbnail: item.thumbnail || '',
  }));
}

// Tier 2 — rss2json (reliable in production)
async function fetchViaRss2Json(): Promise<SubstackPost[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(SUBSTACK_RSS)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'ok' || !data.items?.length) throw new Error('rss2json empty');
  return data.items.map((item: any) => ({
    title: item.title || 'Untitled',
    // item.content is the full article HTML from rss2json; item.description is the short excerpt
    excerpt: truncate(stripHtml(item.content || item.description || '')),
    displayDate: formatDate(item.pubDate),
    link: item.link || 'https://hbwray.substack.com',
    thumbnail: item.thumbnail || item.enclosure?.link || '',
  }));
}

// Tier 3 — corsproxy.io
async function fetchViaCorsproxy(): Promise<SubstackPost[]> {
  const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(SUBSTACK_RSS)}`);
  if (!res.ok) throw new Error(`corsproxy ${res.status}`);
  return parseRssXml(await res.text());
}

// Tier 4 — allorigins
async function fetchViaAllOrigins(): Promise<SubstackPost[]> {
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(SUBSTACK_RSS)}`);
  const json = await res.json();
  return parseRssXml(json.contents as string);
}

// Tier 5 — feedrss.net (alternative public proxy)
async function fetchViaFeedrss(): Promise<SubstackPost[]> {
  const url = `https://feedrss.net/api/rss?url=${encodeURIComponent(SUBSTACK_RSS)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items?.length) throw new Error('feedrss empty');
  return data.items.map((item: any) => ({
    title: item.title || 'Untitled',
    excerpt: truncate(stripHtml(item.description || item.content_text || '')),
    displayDate: formatDate(item.date_published || item.pubDate || ''),
    link: item.url || item.link || 'https://hbwray.substack.com',
    thumbnail: item.image || '',
  }));
}

// -----------------------------------------------------------------------------
// TIMELINE ITEM
// -----------------------------------------------------------------------------
interface TimelineItemProps {
  post: SubstackPost;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function TimelineItem({ post, index, isOpen, onToggle, onClose }: TimelineItemProps) {
  const colourBlock = COLOUR_BLOCKS[index % COLOUR_BLOCKS.length];

  return (
    <div className="relative pl-7">
      <div className="absolute left-0 top-5 w-3 h-3 rounded-full bg-teal-600 border-2 border-gray-50 shadow-sm z-10" />

      {post.displayDate && (
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          {post.displayDate}
        </p>
      )}

      <div className={`bg-gray-50 rounded-lg transition-shadow duration-200 overflow-hidden ${isOpen ? 'shadow-md ring-1 ring-teal-500' : 'hover:shadow-md cursor-pointer'}`}>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onToggle}>

          {/* Thumbnail or colour block */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
            {post.thumbnail ? (
              <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${colourBlock} flex items-center justify-center`}>
                <span className="text-white text-sm font-bold select-none">
                  {post.title.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <h3 className={`flex-1 font-bold leading-snug transition-colors text-sm ${isOpen ? 'text-teal-600' : 'text-gray-900'}`}>
            {post.title}
          </h3>

          <ChevronDown
            size={20}
            className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-500' : ''}`}
          />
        </div>

        {/* Expanded content — inline style avoids Tailwind JIT arbitrary value issues */}
        <div
          style={{ maxHeight: isOpen ? '500px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="border-t border-gray-200 px-5 py-5">
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{post.excerpt}</p>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">continues on Substack</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Read full post <ExternalLink size={16} />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-white text-teal-600 px-6 py-3 rounded-lg border border-teal-600 hover:bg-teal-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// LOADING SKELETON
// -----------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map(n => (
        <div key={n} className="relative pl-7">
          <div className="absolute left-0 top-5 w-3 h-3 rounded-full bg-teal-200 border-2 border-gray-50" />
          <div className="h-3 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN PAGE COMPONENT
// -----------------------------------------------------------------------------
export function BlogPage() {
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      const tiers: [string, () => Promise<SubstackPost[]>][] = [
        ['self-proxy', fetchViaSelfProxy],
        ['rss2json',   fetchViaRss2Json],
        ['corsproxy',  fetchViaCorsproxy],
        ['allorigins', fetchViaAllOrigins],
        ['feedrss',    fetchViaFeedrss],
      ];

      for (const [name, fetcher] of tiers) {
        try {
          const result = await fetcher();
          if (!cancelled && result.length) {
            console.log(`[BlogPage] RSS loaded via: ${name}`);
            setPosts(result);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`[BlogPage] ${name} failed:`, err);
        }
      }
      console.warn('[BlogPage] All tiers failed — using fallback posts');
      if (!cancelled) {
        setPosts(FALLBACK_POSTS);
        setUsingFallback(true);
        setLoading(false);
      }
    }

    loadPosts();
    return () => { cancelled = true; };
  }, []);

  function handleToggle(id: string) {
    setOpenId(prev => (prev === id ? null : id));
  }

  function handleClose() {
    setOpenId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* HERO BANNER — matches AboutResearch structure exactly */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-48 md:h-64">
            <ImageWithFallback
              src={blogHeaderImg}
              alt="Teal illustration of a keyboard and reproductive anatomy"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay using inline style to avoid SWC /opacity class crash */}
            <div
              className="absolute inset-0 flex items-center"
              style={{ background: 'linear-gradient(to right, rgba(17,94,89,0.8), rgba(13,148,136,0.6))' }}
            >
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
                <h1 className="text-white mb-4">Blog & Insights</h1>
                <p className="text-teal-50">
                  Research reflections, critical commentary, and findings on PCOS,
                  digital health, and patient-centred design, updated regularly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SUBSTACK SUBSCRIBE CARD */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rss className="text-teal-600" size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="mb-1">PCOS PhD Dispatches &mdash; on Substack</h2>
                <p className="text-gray-600">
                  Thoughts and findings through the PhD journey and PCOS lived experience.
                </p>
              </div>
            </div>
            <a
              href="https://hbwray.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              Subscribe free
            </a>
          </div>
        </div>

        {/* TIMELINE FEED CARD */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Rss className="text-teal-600" size={20} />
            </div>
            <h2 className="flex-1">Latest Posts</h2>
            <button
              className="md:hidden ml-auto text-teal-600 hover:bg-teal-50 p-2 rounded-lg transition-colors"
              onClick={() => setTimelineExpanded(!timelineExpanded)}
              aria-label={timelineExpanded ? 'Collapse posts' : 'Expand posts'}
            >
              {timelineExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>

          <div className={`${timelineExpanded ? 'block' : 'hidden'} md:block`}>

            {!loading && usingFallback && (
              <div className="mb-6 flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                <Rss size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-teal-800 text-sm leading-relaxed">
                  Showing recent posts — live feed unavailable in this environment.{' '}
                  <a
                    href="https://hbwray.substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-teal-900"
                  >
                    View all posts on Substack
                  </a>
                </p>
              </div>
            )}

            {loading && <LoadingSkeleton />}

            {!loading && (
              <div className="relative">
                <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-6">
                  {posts.map((post, index) => {
                    const id = post.link + post.title;
                    return (
                      <TimelineItem
                        key={id}
                        post={post}
                        index={index}
                        isOpen={openId === id}
                        onToggle={() => handleToggle(id)}
                        onClose={handleClose}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <a
                  href="https://hbwray.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal-600 text-teal-600 font-bold rounded-lg hover:bg-teal-600 hover:text-white transition-colors text-sm"
                >
                  <Rss size={15} />
                  View full archive on Substack
                </a>
              </div>
            )}
          </div>
        </div>

        {/* GET IN TOUCH CARD */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Mail className="text-teal-600" size={20} />
            </div>
            <h2>Get in Touch</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Have a question about the research, or a paper you think should be on the reading list?
            Reach out directly.
          </p>
          <a
            href="mailto:wrayh@uni.coventry.ac.uk"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            <Mail size={15} />
            wrayh@uni.coventry.ac.uk
          </a>
        </div>

      </div>
    </div>
  );
}