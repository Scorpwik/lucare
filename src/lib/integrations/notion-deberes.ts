import { env, notionConfigured } from "@/lib/env";

type NotionPage = {
  id: string;
  properties: Record<string, unknown>;
};

function extractTitle(page: NotionPage): string {
  for (const value of Object.values(page.properties)) {
    const prop = value as { type?: string; title?: Array<{ plain_text?: string }> };
    if (prop?.type === "title" && prop.title?.length) {
      return prop.title.map((t) => t.plain_text ?? "").join("") || "(Sin título)";
    }
  }
  return "(Sin título)";
}

function extractDueDate(page: NotionPage): string | null {
  for (const value of Object.values(page.properties)) {
    const prop = value as {
      type?: string;
      date?: { start?: string; end?: string | null } | null;
    };
    if (prop?.type === "date" && prop.date?.start) {
      const start = prop.date.start;
      if (start.includes("T")) return new Date(start).toISOString();
      return new Date(`${start}T23:59:00`).toISOString();
    }
  }
  return null;
}

function extractStatus(page: NotionPage): string | null {
  for (const value of Object.values(page.properties)) {
    const prop = value as {
      type?: string;
      status?: { name?: string };
      select?: { name?: string };
    };
    if (prop?.type === "status" && prop.status?.name) return prop.status.name;
    if (prop?.type === "select" && prop.select?.name) return prop.select.name;
  }
  return null;
}

function isPendingStatus(status: string | null): boolean {
  if (!status) return true;
  const s = status.toLowerCase();
  return !["done", "hecho", "completado", "completed", "cerrado"].some((x) =>
    s.includes(x),
  );
}

export async function fetchPendingNotionDeberes(): Promise<
  Array<{
    external_id: string;
    title: string;
    due_at: string | null;
    status: string | null;
    raw: Record<string, unknown>;
  }>
> {
  if (!notionConfigured()) return [];

  const dbId = env.NOTION_DEBERES_DB_ID!;
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
      filter: {
        and: [
          {
            property: "fecha",
            date: { is_not_empty: true },
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const fallback = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    if (!fallback.ok) {
      const err = await fallback.text();
      throw new Error(`Notion API: ${err}`);
    }
    const json = (await fallback.json()) as { results?: NotionPage[] };
    return (json.results ?? [])
      .map((page) => {
        const status = extractStatus(page);
        const due_at = extractDueDate(page);
        if (!due_at || !isPendingStatus(status)) return null;
        return {
          external_id: page.id,
          title: extractTitle(page),
          due_at,
          status,
          raw: page as unknown as Record<string, unknown>,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }

  const json = (await res.json()) as { results?: NotionPage[] };
  return (json.results ?? [])
    .map((page) => {
      const status = extractStatus(page);
      if (!isPendingStatus(status)) return null;
      return {
        external_id: page.id,
        title: extractTitle(page),
        due_at: extractDueDate(page),
        status,
        raw: page as unknown as Record<string, unknown>,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}