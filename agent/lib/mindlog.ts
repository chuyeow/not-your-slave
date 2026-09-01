import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export type MindlogKind = "heard" | "thought" | "said" | "did" | "note";

export interface MindlogEntry {
  at: string;
  kind: MindlogKind;
  text: string;
  sessionId?: string;
}

export const FILE = process.env.MINDLOG_FILE ?? ".data/mindlog.jsonl";
const MAX_TEXT = 4000;

export async function append(entry: Omit<MindlogEntry, "at">): Promise<void> {
  const text = entry.text.trim();
  if (text.length === 0) return;

  const line = JSON.stringify({
    at: new Date().toISOString(),
    ...entry,
    text: text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text,
  });

  await mkdir(dirname(FILE), { recursive: true });
  await appendFile(FILE, `${line}\n`, "utf8");
}

// ponytail: reads the whole file to return the tail. Switch to a reverse
// chunked read (or a real store) when the mindlog outgrows a few MB.
export async function read(limit = 50): Promise<MindlogEntry[]> {
  let raw: string;
  try {
    raw = await readFile(FILE, "utf8");
  } catch {
    return [];
  }

  const entries: MindlogEntry[] = [];
  for (const line of raw.split("\n")) {
    if (line.trim().length === 0) continue;
    try {
      entries.push(JSON.parse(line) as MindlogEntry);
    } catch {
      // A torn final line is expected while another write is in flight.
    }
  }

  return entries.slice(-limit);
}
