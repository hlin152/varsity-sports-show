"use client";

// Fixed Demo Page for Sponsor Testing — DO NOT connect to backend
// Toggle DEMO_GAME fields below to simulate different platform states

// ─── DERIVE STATUS FROM START TIME ────────────────────────────────────────────
function computeStatus(startAt: string): "live" | "upcoming" | "replay" {
  const now = new Date();
  const start = new Date(startAt);
  if (now < start) return "upcoming";
  return "live";
}

// ─── MOCK BACKEND RESPONSE ────────────────────────────────────────────────────
const DEMO_GAME = {
  id: "nsu-vs-gcu",
  home: {
    name: "Nevada State University (NSU) Scorpions",
    shortName: "NSU",
    logo: null as string | null, // set to image URL to enable team logo
  },
  away: {
    name: "Grand Canyon University (GCU) 'Lopes",
    shortName: "GCU",
    logo: null as string | null,
  },
  location: "Henderson, Nevada",
  gameTime: "Saturday, Apr 4, 2026 · 3:00 PM PDT",
  startAt: "2026-04-04T22:00:00.000Z", // Apr 4, 2026 · 3:00 PM PDT (UTC-7)
  streamUrl:
    "https://iframe.dacast.com/live/80cea297-81e0-24ec-924b-772c26b87f56/a2edb7a8-c226-4478-861f-539a00109990",
  // ── Status is derived from startAt vs local time; override below to force a state
  status: computeStatus("2026-04-04T22:00:00.000Z") as "live" | "upcoming" | "replay",
  // ── Toggle to simulate paywall: "free" | "ppv" | "subscriber"
  access: "free" as "free" | "ppv" | "subscriber",
  priceUSD: null as number | null,
  league: "Football",
  title: "Varsity Sports Show Live Stream",
  score: { home: 14, away: 7 }, // shown only when status === "live"
};

type LivePageProps = {
  params: { slug: string };
};

// ─── MATCH HEADER ─────────────────────────────────────────────────────────────
function MatchHeader({ game }: { game: typeof DEMO_GAME }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 shadow-xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.12),transparent_60%)]" />

      {/* Top row: status badge + league */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {game.status === "live" && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/40">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
          {game.status === "upcoming" && (
            <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Scheduled
            </span>
          )}
          {game.status === "replay" && (
            <span className="rounded-full bg-neutral-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Replay
            </span>
          )}
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
          {game.league}
        </span>
      </div>

      {/* Teams row */}
      <div className="relative flex items-center justify-between gap-4 text-white">
        {/* Home team */}
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Home</p>
          {game.home.logo ? (
            <img
              src={game.home.logo}
              alt={game.home.name}
              className="h-10 w-10 rounded-full object-contain bg-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold shrink-0">
              {game.home.shortName.slice(0, 3).toUpperCase()}
            </div>
          )}
          <p className="text-base sm:text-lg font-bold leading-tight">{game.home.name}</p>
        </div>

        {/* Center: live score or VS */}
        <div className="text-3xl font-semibold text-white/20 tracking-widest">
          VS
        </div>

        {/* Away team */}
        <div className="flex flex-1 flex-col items-end gap-2">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Away</p>
          {game.away.logo ? (
            <img
              src={game.away.logo}
              alt={game.away.name}
              className="h-10 w-10 rounded-full object-contain bg-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold shrink-0">
              {game.away.shortName.slice(0, 3).toUpperCase()}
            </div>
          )}
          <p className="text-base sm:text-lg font-bold leading-tight text-right">{game.away.name}</p>
        </div>
      </div>

      {/* Bottom meta strip */}
      <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-white/50 border-t border-white/10 pt-4">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {game.gameTime}
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {game.location}
        </span>
        <span className="ml-auto text-white/30 italic">{game.title}</span>
      </div>
    </section>
  );
}

// ─── VIDEO PLAYER ─────────────────────────────────────────────────────────────
function VideoPlayer({ game }: { game: typeof DEMO_GAME }) {
  // Paywall placeholder
  if (game.access !== "free") {
    return (
      <section className="aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xl flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20">
          <svg className="h-7 w-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-lg">Subscribe to watch</p>
          <p className="text-white/40 text-sm mt-1">
            {game.access === "ppv"
              ? `This game is pay-per-view · $${game.priceUSD?.toFixed(2) ?? "–"}`
              : "This content is for subscribers only"}
          </p>
        </div>
        <button className="mt-2 rounded-full bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all px-6 py-2.5 text-sm font-semibold text-white">
          {game.access === "ppv"
            ? `Buy Access · $${game.priceUSD?.toFixed(2) ?? "–"}`
            : "Subscribe Now"}
        </button>
      </section>
    );
  }

  // Not live — show status-aware placeholder instead of the iframe
  if (game.status !== "live") {
    const message =
      game.status === "upcoming"
        ? "This game has not started yet"
        : "Replay not available";

    return (
      <section className="aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-xl flex flex-col items-center justify-center gap-3 text-center px-6">
        <svg className="h-8 w-8 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
        </svg>
        <p className="text-white/70 font-semibold text-base">{message}</p>
      </section>
    );
  }

  // Live — render the iframe
  return (
    <section className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
      <iframe
        id="80cea297-81e0-24ec-924b-772c26b87f56-live-a2edb7a8-c226-4478-861f-539a00109990"
        src={game.streamUrl}
        className="w-full h-full"
        style={{ border: "none", overflow: "hidden" }}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </section>
  );
}

// ─── INFO STRIP ───────────────────────────────────────────────────────────────
function InfoStrip({ game }: { game: typeof DEMO_GAME }) {
  return (
    <section className="flex flex-wrap items-center gap-3">
      {/* Access badge */}
      {game.access === "free" && (
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
          <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-emerald-700">Free to Watch</span>
        </div>
      )}
      {game.access === "ppv" && (
        <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2">
          <svg className="h-4 w-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span className="text-sm font-semibold text-amber-700">
            PPV · ${game.priceUSD?.toFixed(2) ?? "–"}
          </span>
        </div>
      )}
      {game.access === "subscriber" && (
        <div className="flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-2">
          <svg className="h-4 w-4 text-violet-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-semibold text-violet-700">Subscribers Only</span>
        </div>
      )}

      {/* League */}
      <div className="flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 px-4 py-2">
        <svg className="h-4 w-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-neutral-700">{game.league}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 px-4 py-2">
        <svg className="h-4 w-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium text-neutral-700">{game.location}</span>
      </div>

      {/* Game time */}
      <div className="flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 px-4 py-2">
        <svg className="h-4 w-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-neutral-700">{game.gameTime}</span>
      </div>
    </section>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LivePage({ params }: LivePageProps) {
  const { slug } = params;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 000-1.69L9.54 5.98A.998.998 0 008 6.82z" />
          </svg>
          <span className="text-sm font-semibold text-neutral-800 tracking-tight">
            Varsity Sports Show
          </span>
          <span className="text-neutral-300 text-sm">/</span>
          <span className="text-sm text-neutral-500">Live</span>
        </div>
        <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[11px] font-mono text-neutral-400">
          {slug}
        </span>
      </div>

      <MatchHeader game={DEMO_GAME} />
      <VideoPlayer game={DEMO_GAME} />
      <InfoStrip game={DEMO_GAME} />
    </main>
  );
}

