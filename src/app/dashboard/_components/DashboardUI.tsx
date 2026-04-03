import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Play, // Open Icon
  Calendar, // Upcoming Icon
  Clock, // Past Icon
  Search, // Search Icon
  UserCog, // Shield Icon
  Filter as FilterIcon,
  Rows,
  Columns,
  Ticket,
  ExternalLink,
  Tv,
  Radio,
  DotIcon,
  Trash2,
  Calendar as CalendarIcon
} from "lucide-react"; // Custom SVG icons
import { UserButton, useUser } from "@clerk/nextjs";
import type { Stream, StreamStatus } from "@/lib/types/stream";
import { RoleInitializer } from "./RoleInitializer"; // Set sign up user with role = viewer
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

async function openBillingPortal() {
  const res = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
  });

  if (!res.ok) {
    console.error('Failed to create portal session');
    return;
  }

  const data = await res.json();
  window.location.href = data.url;
}

type StartTimeFieldProps = {
  value: string;                    // ISO string
  onChange: (value: string) => void;
};

export function StartTimeField({ value, onChange }: StartTimeFieldProps) {
  const initialDate = value ? new Date(value) : new Date();
  const panelRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<Date>(initialDate);
  const [hour, setHour] = useState<number>(() => {
    const h = initialDate.getHours();
    const h12 = h % 12 || 12;
    return h12;
  });
  const [minute, setMinute] = useState<string>(() => {
    const m = initialDate.getMinutes();
    return String(m).padStart(2, "0");
  });
  const [ampm, setAmpm] = useState<"AM" | "PM">(
    initialDate.getHours() >= 12 ? "PM" : "AM"
  );
  const [open, setOpen] = useState<boolean>(false);

  // Assemble the internal state into an ISO string and pass it to the parent layer.
  const updateIso = (d: Date, h12: number, min: string, meridiem: "AM" | "PM") => {
    const cloned = new Date(d);
    const hour24 =
      meridiem === "PM"
        ? (h12 % 12) + 12
        : h12 % 12; // 12 AM -> 0, 12 PM -> 12

    cloned.setHours(hour24);
    cloned.setMinutes(Number(min));
    cloned.setSeconds(0);
    cloned.setMilliseconds(0);

    onChange(cloned.toISOString());
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // If the click is not in the dropdown panel → Collapse
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    };

    // Listen for mousedown (faster response than click).
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // When the value changes externally (e.g., a form reset), synchronize back.
  useEffect(() => {
    if (!value) return;
    const d = new Date(value);
    const h = d.getHours();
    const h12 = h % 12 || 12;
    const m = d.getMinutes();
    setDate(d);
    setHour(h12);
    setMinute(String(m).padStart(2, "0"));
    setAmpm(h >= 12 ? "PM" : "AM");
  }, [value]);

  // The text displayed on the main button: Feb 14, 2025 · 7:00 PM
  const displayText = `${format(date, "MMM dd, yyyy")} · ${format(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      ampm === "PM" ? (hour % 12) + 12 : hour % 12,
      Number(minute)
    ),
    "h:mm a"
  )}`;

  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return (
    <div className="space-y-2 relative">
      {/* Main button: Displays the currently selected time. */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left hover:border-neutral-400 bg-white"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-neutral-600" />
          <span className="text-sm text-neutral-900">{displayText}</span>
        </div>
        <Clock className="h-4 w-4 text-neutral-500" />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="mt-2 grid gap-4 rounded-2xl border bg-white p-4 shadow-xl sm:grid-cols-[1.4fr_1fr]" ref={panelRef}>
          {/* Left side：Calendar */}
          <div>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (!selectedDate) return;
                setDate(selectedDate);
                updateIso(selectedDate, hour, minute, ampm);
              }}
              weekStartsOn={0} // Sunday
            />
          </div>

          {/* Right side: Time + AM/PM + Quick Select */}
          <div className="flex flex-col gap-3">
            {/* Subtitle */}
            <div>
              <div className="text-sm font-medium text-neutral-900">
                Time (Phoenix Local Time)
              </div>
            </div>

            {/* Time + AM/PM switch */}
            <div className="flex items-center gap-2">
              {/* Hour */}
              <input
                type="number"
                min={1}
                max={12}
                value={hour}
                onChange={(e) => {
                  const val = Math.min(12, Math.max(1, Number(e.target.value) || 1));
                  setHour(val);
                  updateIso(date, val, minute, ampm);
                }}
                className="w-16 rounded-lg border px-2 py-1 text-center text-sm"
              />

              <span className="text-sm text-neutral-600">:</span>

              {/* Minute */}
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  val = Math.min(59, Math.max(0, val));
                  const padded = String(val).padStart(2, "0");
                  setMinute(padded);
                  updateIso(date, hour, padded, ampm);
                }}
                className="w-16 rounded-lg border px-2 py-1 text-center text-sm"
              />

              {/* AM / PM segmented control */}
              <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAmpm("AM");
                    updateIso(date, hour, minute, "AM");
                  }}
                  className={`px-2 py-1 rounded-full ${
                    ampm === "AM" ? "bg-black text-white" : "text-neutral-700"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAmpm("PM");
                    updateIso(date, hour, minute, "PM");
                  }}
                  className={`px-2 py-1 rounded-full ${
                    ampm === "PM" ? "bg-black text-white" : "text-neutral-700"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


// --- UI helpers ---
const useIsAdmin = () => {
  const { user } = useUser();
  const role = (user?.unsafeMetadata?.role as string | undefined) ?? "viewer";

  return role === "admin";
};

// --- Badge: Status tags---
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>
  );
}

// --- Pill: Rounded corner buttons are used to switch states (tabs / filters).---
function Pill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition shadow-sm ${
        active
          ? "bg-black text-white border-black"
          : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

// --- Card: A card container used to enclose each Stream. ---
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition ${className}`}>
      {children}
    </div>
  );
}


// --- Derive stream status from startAt relative to local time ---
// A game is "past" if it started more than 4 hours ago, "live" if started within the last 4 hours, "upcoming" if in the future.
function computeStatus(startAt: string): StreamStatus {
  const now = new Date();
  const start = new Date(startAt);
  if (now < start) return "upcoming";
  if (now.getTime() - start.getTime() > 4 * 60 * 60 * 1000) return "past";
  return "live";
}

// --- Mock Data (combined fixed + test entries) — replace with [] at official launch ---
// Returns a fresh array on each call so computeStatus always runs with the current time.
// TODO: remove mock data once ready
function getMockStreams(): Stream[] {
  return [
  {
    id: "0",
    slug: "csn-vs-yavapai-2026-04-04",
    title: "Varsity Sports Show Live Stream",
    league: "Baseball",
    home: { name: "College of Southern Nevada", shortName: "CSN", logo: null },
    away: { name: "Yavapai College", shortName: "YC", logo: null },
    location: "Las Vegas, Nevada",
    startAt: "2026-04-04T18:45:00.000Z", // Saturday, Apr 4, 2026 · 11:45 AM PDT (UTC-7, Las Vegas)
    status: computeStatus("2026-04-04T18:45:00.000Z"),
    access: "free",
    priceUSD: null,
    thumbnailUrl: "https://cdn.forumcomm.com/dims4/default/6df5ee2/2147483647/strip/true/crop/4000x2667+0+1/resize/840x560!/format/webp/quality/90/?url=https%3A%2F%2Fforum-communications-production-web.s3.us-west-2.amazonaws.com%2Fbrightspot%2Fc8%2Fa7%2F7aed3ece422ca6707ceb7d646ab0%2F111425-hsfb-howard-wall-class9a-12.jpg",
    dacastIframeSrc: "https://iframe.dacast.com/live/80cea297-81e0-24ec-924b-772c26b87f56/a2edb7a8-c226-4478-861f-539a00109990",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ];
}

// --- Stream card Info with Livestream Data Structure ---
function StreamCard({
  stream,
  layout = "grid",
}: {
  stream: Stream;
  layout?: "grid" | "list";
}) {
  const date = new Date(stream.startAt);
  const timeText = date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });

  // LIVE | Upcoming | Past
  const statusStyles: Record<StreamStatus, string> = {
    live: "bg-red-50 text-red-700 ring-1 ring-red-200",
    upcoming: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    past: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200",
  };

  return (
    <Card className={layout === "list" ? "flex overflow-hidden" : "overflow-hidden"}>
      <div className={layout === "list" ? "w-48 shrink-0" : "aspect-video w-full"}>
        <div className="relative h-full w-full bg-neutral-200">
          {/* Thumbnail */}
          {stream.thumbnailUrl && (
            <img src={stream.thumbnailUrl} alt={stream.title} className="h-full w-full object-cover" />
          )}
          {/* Status badge */}
          <div className="absolute left-2 top-2 flex items-center gap-2">
            <Badge className={statusStyles[stream.status] + " backdrop-blur"}>
              {stream.status === "live" ? (
                <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> LIVE</span> // LIVE Badge
              ) : stream.status === "upcoming" ? (
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Upcoming</span> // Upcoming Badge
              ) : (
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Past</span> // Past Badge
              )}
            </Badge>
            {stream.access !== "free" ? (
              <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200"><Ticket className="h-3 w-3 mr-1" />${stream.priceUSD?.toFixed(2) ?? "–"}</Badge> // Single Ticket Badge
            ) : (
              <Badge className="bg-sky-50 text-sky-700 ring-1 ring-sky-200"><Ticket className="h-3 w-3 mr-1" />Free</Badge> // Free Ticket Badge
            )}
          </div>
        </div>
      </div>

      <div className={layout === "list" ? "flex-1 p-4" : "p-4"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* Livestream Title */}
            <h3 className="text-base font-semibold leading-tight line-clamp-2">{stream.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {/* home vs away and League Info */}
              <span className="font-medium">{stream.home.shortName}</span> vs <span className="font-medium">{stream.away.shortName}</span>
              <span className="mx-2">·</span>
              <span className="text-neutral-500">{stream.league}</span>
            </p>
          </div>
          {/* Open Button → /live/[slug] */}
          <a
            href={`/live/${stream.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
            title="Open stream"
          >
            {stream.status === "live" ? <Play className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />} Open
          </a>
        </div>

        {/* Livestream Time Info */}
        <div className="mt-2 text-sm text-neutral-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{timeText}</span>
        </div>
      </div>
    </Card>
  );
}

// --- Empty state: if no stream data ---
type EmptyStateVariant = "live" | "upcoming" | "past";
function EmptyState({ variant }: { variant: EmptyStateVariant }) {
  const config = {
    live: {
      icon: Tv,
      title: "No live games right now",
      description:
        "When a game is live, it will appear here automatically. You can still browse upcoming games or replays below.",
    },
    upcoming: {
      icon: Calendar,
      title: "No upcoming games yet",
      description:
        "Once new games are scheduled, they will show up here. Check back soon or follow your school for updates.",
    },
    past: {
      icon: Clock,
      title: "No past games in your history",
      description:
        "Replays will appear here after games have ended. Watch live or upcoming games in the meantime.",
    },
  }[variant];

  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md shadow-neutral-300/60">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">
        {config.title}
      </h3>
      <p className="mt-2 max-w-md mx-auto text-sm text-neutral-600">
        {config.description}
      </p>
    </div>
  );
}

// --- Main Dashboard ---
export default function DashboardUI() {
  const isAdmin = useIsAdmin();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StreamStatus | "all">("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [viewMode, setViewMode] = useState<"viewer" | "admin">("viewer");
  const [streams, setStreams] = useState<Stream[]>(getMockStreams); // TODO: replace with [] when official launch
  const [showFilters, setShowFilters] = useState(false);
  const [filterLeague, setFilterLeague] = useState<string>("all");
  const [filterAccess, setFilterAccess] = useState<"all" | "free" | "ppv" | "subscriber">("all");

  const allLeagues = useMemo(
    () => Array.from(new Set(streams.map((s) => s.league).filter(Boolean))).sort(),
    [streams]
  );

  const filtered = useMemo(() => {
    return streams
      .map((s) => ({ ...s, status: computeStatus(s.startAt) })) // recompute status from startAt on every render
      .filter((s) => (tab === "all" ? true : s.status === tab))
      .filter((s) => (filterLeague === "all" ? true : s.league === filterLeague))
      .filter((s) => (filterAccess === "all" ? true : s.access === filterAccess))
      .filter((s) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const hay = `${s.title} ${s.home.shortName} ${s.home.name} ${s.away.shortName} ${s.away.name} ${s.league}`.toLowerCase();
        return hay.includes(q);
      });
  }, [streams, query, tab, filterLeague, filterAccess]);

  const live = filtered.filter((s) => s.status === "live");
  const upcoming = filtered.filter((s) => s.status === "upcoming");
  const past = filtered.filter((s) => s.status === "past");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <RoleInitializer />

      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight">VSS Live</h1>
              <p className="text-sm text-neutral-600">Welcome back! Browse your live and upcoming games.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search teams, league, title..."
                  className="w-72 rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                <Pill active={tab === "all"} onClick={() => setTab("all")}>All</Pill>
                <Pill active={tab === "live"} onClick={() => setTab("live")}>Live</Pill>
                <Pill active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</Pill>
                <Pill active={tab === "past"} onClick={() => setTab("past")}>Past</Pill>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
                {/* Grid */}
                <button
                  onClick={() => {
                    setLayout("grid");
                    setViewMode("viewer");
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                    viewMode === "viewer" && layout === "grid"
                      ? "bg-black text-white"
                      : "hover:bg-neutral-50"
                  }`}
                  title="Grid"
                >
                  <Columns className="h-4 w-4" />
                  Grid
                </button>

                {/* List */}
                <button
                  onClick={() => {
                    setLayout("list");
                    setViewMode("viewer");
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                    viewMode === "viewer" && layout === "list"
                      ? "bg-black text-white"
                      : "hover:bg-neutral-50"
                  }`}
                  title="List"
                >
                  <Rows className="h-4 w-4" />
                  List
                </button>

                {/* Admin（Only admin can see） */}
                {isAdmin && (
                  <button
                    onClick={() => setViewMode("admin")}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                      viewMode === "admin"
                        ? "bg-black text-white"
                        : "hover:bg-neutral-50 text-neutral-700"
                    }`}
                    title="Admin tools"
                  >
                    <UserCog className="h-4 w-4" />
                    Admin
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <UserButton
                appearance={{
                  elements: {
                    avatarImage: "rounded-full border-2 border-violet-600",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Subscription"
                    labelIcon={<DotIcon />}
                    onClick={openBillingPortal}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>

          </div>
        </div>
      </header>

      {/* Body of the Dashboard */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Admin Mode */}
        {viewMode === "admin" && isAdmin && (
          <AdminPanel onCreated={(s) => setStreams((prev) => [s, ...prev])} />
        )}

        {/* Viewer Mode */}
        {viewMode === "viewer" && (
          <>
            { /* Live Now section */ }
            {(tab === "all" || tab === "live") && (
              <section className="mb-8">
                {/* Section grid / View all Button*/}
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Live now</h2>
                  <button onClick={() => setTab("live")} className="text-sm text-neutral-700 hover:underline">View all</button>
                </div>

                {live.length === 0 ? (
                  <EmptyState variant="live" />
                ) : layout === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {live.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {live.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="list" />
                    ))}
                  </div>
                )}
              </section>
            )}

            { /* Upcoming section */ }
            {tab === "all" || tab === "upcoming" ? (
              <section className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Upcoming</h2>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters((v) => !v)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        showFilters || filterLeague !== "all" || filterAccess !== "all"
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <FilterIcon className="h-4 w-4" /> Filters
                      {(filterLeague !== "all" || filterAccess !== "all") && (
                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                          {(filterLeague !== "all" ? 1 : 0) + (filterAccess !== "all" ? 1 : 0)}
                        </span>
                      )}
                    </button>

                    {showFilters && (
                      <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                        {/* League filter */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">League</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {["all", ...allLeagues].map((l) => (
                            <button
                              key={l}
                              onClick={() => setFilterLeague(l)}
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                filterLeague === l
                                  ? "border-black bg-black text-white"
                                  : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                              }`}
                            >
                              {l === "all" ? "All" : l}
                            </button>
                          ))}
                        </div>

                        {/* Access filter */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Access</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(["all", "free", "ppv", "subscriber"] as const).map((a) => (
                            <button
                              key={a}
                              onClick={() => setFilterAccess(a)}
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition capitalize ${
                                filterAccess === a
                                  ? "border-black bg-black text-white"
                                  : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                              }`}
                            >
                              {a === "all" ? "All" : a === "ppv" ? "PPV" : a.charAt(0).toUpperCase() + a.slice(1)}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => { setFilterLeague("all"); setFilterAccess("all"); }}
                          className="w-full rounded-full border border-neutral-200 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <EmptyState variant="upcoming" />
                ) : layout === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="list" />
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            { /* Past Games section */ }
            {tab === "all" || tab === "past" ? (
              <section className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Past Games</h2>
                  <button onClick={() => setTab("past")} className="text-sm text-neutral-700 hover:underline">Browse replays</button>
                </div>

                {past.length === 0 ? (
                  <EmptyState variant="past" />
                ) : layout === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {past.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {past.map((s) => (
                      <StreamCard key={s.id} stream={s} layout="list" />
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {/* Footer CTA */}
            <div className="mt-12 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Radio className="h-5 w-5 text-neutral-600" />
              </div>

              <h3 className="text-lg font-semibold">Looking for a specific matchup?</h3>
              <p className="mt-1 text-sm text-neutral-600">Use the search above or go to the full schedule to find your team.</p>
              <div className="mt-4 inline-flex gap-2">
                <a href="https://varsitysportsshow.com/schedule" target="_blank" rel="noopener noreferrer" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Full schedule</a>
                <a href="https://varsitysportsshow.com/plans" target="_blank" rel="noopener noreferrer" className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">Subscription plans</a>
              </div>
              
            </div>
          </>
        )}


      </main>
    </div>
  );
}

// Admin Panel
function AdminPanel({ onCreated }: { onCreated: (s: Stream) => void }) {
  const [title, setTitle] = useState("");
  const [league, setLeague] = useState("");
  const [schoolA, setSchoolA] = useState("");
  const [schoolB, setSchoolB] = useState("");
  const [startAt, setStartAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString();
  });
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  type FormAccessType = "" | "free" | "ppv" | "subscriber";
  const [access, setAccess] = useState<FormAccessType>("");
  const [submitting, setSubmitting] = useState(false);

  const handleAccessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value as FormAccessType | "blank";

  if (value === "blank") {
    setAccess("");
    return;
  }

  setAccess(value);
};

  const toSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async () => {
      const requiredFields = [
      { value: title, name: "Title" },
      { value: league, name: "League" },
      { value: schoolA, name: "Home / School A" },
      { value: schoolB, name: "Away / School B" },
      { value: startAt, name: "Start Time" },
      { value: access, name: "Access" },
      { value: thumbnail, name: "Thumbnail URL" },
      { value: sourceUrl, name: "Stream Source" },
    ];

    for (const field of requiredFields) {
      if (!field.value || field.value.toString().trim() === "") {
        alert(`${field.name} is required`);
        return;
      }
    }

    if (access === "ppv" && (!price || Number(price) <= 0)) {
      alert("Price is required when access = Pay-per-view");
      return;
    }

    try {
      setSubmitting(true);

      const created: Stream = {
        id: Date.now().toString(),
        slug: toSlug(`${schoolA}-${schoolB}-${title}`),
        title,
        league,
        home: { name: schoolA, shortName: schoolA.slice(0, 3).toUpperCase(), logo: null },
        away: { name: schoolB, shortName: schoolB.slice(0, 3).toUpperCase(), logo: null },
        startAt: new Date(startAt).toISOString(),
        status: new Date(startAt).getTime() <= Date.now() ? "live" : "upcoming",
        access: access as "free" | "ppv" | "subscriber",
        priceUSD: access === "ppv" ? Number(price) : null,
        thumbnailUrl: thumbnail,
        dacastIframeSrc: sourceUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onCreated(created);
      alert("Stream created!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Create Livestream - TESTING Feature Not Submit</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <div className="text-sm font-medium mb-1">Game Title</div>
          <div className="relative">
            <input required
              className="w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wolves vs Tigers"
            />
            <button
              type="button"
              onClick={() => setTitle("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </label>

        <label>
          <div className="text-sm font-medium mb-1">League</div>
          <div className="relative">
            <input required
              className="w-full border rounded-lg px-3 py-2"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              placeholder="HS Football"
            />
            <button
              type="button"
              onClick={() => setLeague("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </label>

        <label>
          <div className="text-sm font-medium mb-1">Home / School A</div>
          <div className="relative">
            <input required
              className="w-full border rounded-lg px-3 py-2"
              value={schoolA}
              onChange={(e) => setSchoolA(e.target.value)}
              placeholder="Desert Ridge"
            />
            <button
              type="button"
              onClick={() => setSchoolA("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </label>

        <label>
          <div className="text-sm font-medium mb-1">Away / School B</div>
          <div className="relative">
            <input required
              className="w-full border rounded-lg px-3 py-2"
              value={schoolB}
              onChange={(e) => setSchoolB(e.target.value)}
              placeholder="Mesa East"
            />
            <button
              type="button"
              onClick={() => setSchoolB("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </label>

        <label>
          <div className="text-sm font-medium mb-1">Start Time (Default 30 mins later)</div>
          <StartTimeField 
            value={startAt}
            onChange={(iso) => setStartAt(iso)}
          />
        </label>

        <label>
          <div className="text-sm font-medium mb-1">Access</div>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={access}
            onChange={handleAccessChange}
            required
          >
            <option value="" disabled hidden>
              Select access type...
            </option>

            <option value="blank"> </option>
            <option value="free">Free</option>
            <option value="ppv">Pay-per-view</option>
            <option value="subscriber">Subscriber only</option>
          </select>
        </label>

        {access == "ppv" && (
          <label>
            <div className="text-sm font-medium mb-1">Price</div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center font-bold text-gray-500">$</span>   
              <input required
                min="0"
                step="0.01"
                className="w-full border rounded-lg px-3 py-2 pl-8 pr-10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
              />
              <button
                type="button"
                onClick={() => setPrice("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </label>
        )}

        <label className="sm:col-span-2">
          <div className="text-sm font-medium mb-1">
            Thumbnail URL (This will appear at the dashboard grid, Fill in for preview below)
          </div>
          <div className="relative">
            <input required
              className="w-full border rounded-lg px-3 py-2"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="e.g., https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=1200&q=80&auto=format&fit=crop"
            />
            <button
              type="button"
              onClick={() => setThumbnail("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {thumbnail && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Thumbnail Preview:</p>
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="w-48 h-28 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src = "";
                }}
              />
            </div>
          )}
        </label>

        <label className="sm:col-span-2">
          <div className="text-sm font-medium mb-1">Stream Source (Click Dacast share link to get iframe URL & Paste here)</div>
          <div className="relative">
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g., https://iframe.dacast.com/live/80cea297-81e0-24ec-924b-772c26b87f56/a2edb7a8-c226-4478-861f-539a00109990"
            />
            <button
              type="button"
              onClick={() => setSourceUrl("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </label>
      </div>

      <button
        onClick={handleCreate}
        disabled={submitting}
        className="mt-6 rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
      >
        {submitting ? "Creating..." : "Create livestream"}
      </button>
    </div>
  );
}
