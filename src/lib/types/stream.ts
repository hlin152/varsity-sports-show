// lib/types/stream.ts
export type AccessType = "free" | "ppv" | "subscriber";
export type StreamStatus = "live" | "upcoming" | "past";

export interface StreamTeam {
  name: string;
  shortName: string;
  logo?: string | null;
}

export interface Stream {
  id: string;
  slug: string;

  title: string;
  league: string;
  home: StreamTeam;
  away: StreamTeam;

  location?: string | null;  // Venue / city

  startAt: string;          // ISO time
  status: StreamStatus;

  access: AccessType;
  priceUSD?: number | null;

  thumbnailUrl?: string | null;

  // The backend developers are responsible for filling in the fields related to Dacast.
  dacastIframeSrc?: string | null;   // Complete iframe src
  dacastChannelId?: string | null;   // If you want to use the channelId to create your own URL

  createdAt: string;
  updatedAt: string;
}
