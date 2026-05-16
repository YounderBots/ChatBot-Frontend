/* ─────────────────────────────────────────────────
   Dashboard mock data — swap out for real API calls
   by replacing the functions in Dashboard.jsx
───────────────────────────────────────────────── */

const DAYS_SHORT   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function todayLabel(daysAgo, total) {
  const d = new Date();
  d.setDate(d.getDate() - (total - 1 - daysAgo));
  if (total <= 7) return DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/* ── KPI ── */
export const MOCK_KPI = {
  totalConversations: 1284,
  activeUsers:        42,
  avgResponseTime:    1.4,
  resolutionRate:     87.3,
};

/* ── Trends (7-day) ── */
const BASE_7 = [54,78,91,63,110,97,85];
export const MOCK_TRENDS_7 = BASE_7.map((total, i) => ({
  date:      todayLabel(i, 7),
  total,
  resolved:  Math.round(total * 0.82),
  escalated: Math.round(total * 0.07),
}));

/* ── Trends (30-day) ── */
const BASE_30 = [
  48,55,62,70,58,43,50,
  67,82,91,78,84,95,103,
  88,76,92,110,99,85,72,
  80,94,108,97,115,102,89,
  96,104,
];
export const MOCK_TRENDS_30 = BASE_30.map((total, i) => ({
  date:      todayLabel(i, 30),
  total,
  resolved:  Math.round(total * 0.81),
  escalated: Math.round(total * 0.08),
}));

/* ── Intent Distribution ── */
export const MOCK_INTENTS = [
  { name: "Support",      value: 312 },
  { name: "Pricing",      value: 198 },
  { name: "Booking",      value: 175 },
  { name: "Complaint",    value: 143 },
  { name: "Cancellation", value: 121 },
  { name: "Refund",       value: 98  },
  { name: "Upgrade",      value: 87  },
  { name: "Feedback",     value: 64  },
  { name: "Downgrade",    value: 52  },
  { name: "Other",        value: 34  },
];

/* ── Peak Hours (7 rows × 24 cols) ── */
// Business-hours-heavy pattern — busiest Mon–Fri, 9 AM – 6 PM
const peakBase = [
  // Mon
  [0,0,0,0,0,1,3,8,22,45,68,74,62,70,65,58,42,30,18,10,5,2,1,0],
  // Tue
  [0,0,0,0,0,2,4,10,28,52,76,81,70,78,72,63,47,33,20,12,6,3,1,0],
  // Wed
  [0,0,0,0,0,2,5,12,30,55,80,88,75,83,76,67,50,36,22,13,7,3,2,0],
  // Thu
  [0,0,0,0,0,1,4,11,27,50,73,79,68,75,70,61,45,31,19,11,5,2,1,0],
  // Fri
  [0,0,0,0,0,1,3,9,24,47,70,77,65,72,68,60,44,30,16,9,4,2,1,0],
  // Sat
  [0,0,0,0,0,0,1,4,10,18,28,35,32,30,25,20,14,9,5,3,1,0,0,0],
  // Sun
  [0,0,0,0,0,0,1,2,7,14,22,27,25,23,19,15,10,6,3,2,1,0,0,0],
];

export const MOCK_PEAK_HOURS = DAYS_SHORT.map((day, i) => ({
  day,
  dayIndex: i,
  hours: peakBase[i],
}));

/* ── Recent Conversations ── */
export const MOCK_RECENT_CONVERSATIONS = [
  { id:1,  intent:"Support",      message:"My account is locked and I can't reset my password. Can you help?",            timeAgo:"2 min ago",  confidence:94 },
  { id:2,  intent:"Pricing",      message:"What's the difference between the Pro and Enterprise plans?",                  timeAgo:"5 min ago",  confidence:88 },
  { id:3,  intent:"Booking",      message:"I'd like to schedule a demo for next Tuesday at 2 PM.",                        timeAgo:"9 min ago",  confidence:91 },
  { id:4,  intent:"Complaint",    message:"I've been charged twice for the same invoice this month.",                     timeAgo:"14 min ago", confidence:86 },
  { id:5,  intent:"Cancellation", message:"How do I cancel my subscription without losing my data?",                     timeAgo:"18 min ago", confidence:79 },
  { id:6,  intent:"Refund",       message:"I was billed for a feature I never used. I'd like a refund.",                 timeAgo:"25 min ago", confidence:83 },
  { id:7,  intent:"Upgrade",      message:"I want to upgrade to the annual plan — is there a discount?",                 timeAgo:"31 min ago", confidence:90 },
  { id:8,  intent:"Feedback",     message:"The new dashboard design is much cleaner. Great improvement!",                timeAgo:"38 min ago", confidence:72 },
  { id:9,  intent:"Downgrade",    message:"Our team has shrunk. Can I move to a smaller tier without penalties?",        timeAgo:"44 min ago", confidence:77 },
  { id:10, intent:"Support",      message:"The CSV export isn't working — it downloads an empty file every time.",       timeAgo:"52 min ago", confidence:95 },
];

/* ── Async helpers (simulate network latency) ── */
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const mockGetKpi          = async ()      => { await delay(120); return MOCK_KPI; };
export const mockGetTrends       = async (range) => { await delay(180); return range === "30" ? MOCK_TRENDS_30 : MOCK_TRENDS_7; };
export const mockGetIntents      = async ()      => { await delay(150); return MOCK_INTENTS; };
export const mockGetPeakHours    = async ()      => { await delay(160); return MOCK_PEAK_HOURS; };
export const mockGetRecentConvs  = async ()      => { await delay(130); return MOCK_RECENT_CONVERSATIONS; };
