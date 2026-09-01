import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export type MindlogKind = "woke" | "heard" | "thought" | "said" | "did" | "note";

export interface MindlogEntry {
  at: string;
  kind: MindlogKind;
  text: string;
  sessionId?: string;
}

export const FILE = process.env.MINDLOG_FILE ?? ".data/mindlog.jsonl";
const MAX_TEXT = 4000;

let dirReady: Promise<unknown> | undefined;

export async function append(entry: Omit<MindlogEntry, "at">): Promise<void> {
  const text = entry.text.trim();
  if (text.length === 0) return;

  const line = JSON.stringify({
    at: new Date().toISOString(),
    ...entry,
    text: text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text,
  });

  // Once per process, not once per entry: a busy turn appends dozens of times.
  dirReady ??= mkdir(dirname(FILE), { recursive: true });
  await dirReady;
  await appendFile(FILE, `${line}\n`, "utf8");
}

// ponytail: reads the whole file. Switch to a reverse chunked read (or a real
// store) when the mindlog outgrows a few MB. Parsing, at least, is only ever
// done for the lines actually returned.
async function lines(): Promise<string[]> {
  try {
    return (await readFile(FILE, "utf8")).split("\n").filter((line) => line.trim().length > 0);
  } catch {
    return [];
  }
}

// A torn final line is expected while another write is in flight, so a line
// that will not parse is dropped rather than failing the whole read.
const parse = (raw: string[]): MindlogEntry[] =>
  raw.flatMap((line) => {
    try { return [JSON.parse(line) as MindlogEntry]; } catch { return []; }
  });

export async function read(limit = 50): Promise<MindlogEntry[]> {
  return parse((await lines()).slice(-limit));
}

export async function search(query: string, limit = 20): Promise<MindlogEntry[]> {
  const needle = query.toLowerCase();
  // Filter raw lines first so non-matching entries are never parsed, then match
  // again on `text` alone: the raw line also carries kind, timestamp and ids.
  const candidates = (await lines()).filter((line) => line.toLowerCase().includes(needle));
  return parse(candidates)
    .filter((entry) => entry.text.toLowerCase().includes(needle))
    .slice(-limit);
}
