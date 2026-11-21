export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

function parseEventStart(ev: GoogleCalendarEvent): string {
  const iso = ev.start?.dateTime ?? ev.start?.date;
  if (!iso) return new Date().toISOString();
  if (ev.start?.date && !ev.start?.dateTime) {
    return new Date(`${iso}T12:00:00`).toISOString();
  }
  return new Date(iso).toISOString();
}

function parseEventEnd(ev: GoogleCalendarEvent): string | null {
  const iso = ev.end?.dateTime ?? ev.end?.date;
  if (!iso) return null;
  if (ev.end?.date && !ev.end?.dateTime) {
    return new Date(`${iso}T23:59:59`).toISOString();
  }
  return new Date(iso).toISOString();
}

export async function fetchUpcomingGoogleEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
): Promise<
  Array<{
    external_id: string;
    title: string;
    starts_at: string;
    ends_at: string | null;
    raw: Record<string, unknown>;
  }>
> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API: ${err}`);
  }
  const json = (await res.json()) as { items?: GoogleCalendarEvent[] };
  return (json.items ?? [])
    .filter((ev) => ev.id)
    .map((ev) => ({
      external_id: ev.id,
      title: ev.summary?.trim() || "(Sin título)",
      starts_at: parseEventStart(ev),
      ends_at: parseEventEnd(ev),
      raw: ev as unknown as Record<string, unknown>,
    }));
}