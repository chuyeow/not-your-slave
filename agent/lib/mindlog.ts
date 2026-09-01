import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
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

// The web page polls every few seconds while the file only changes during a
// turn, so an unchanged file costs one stat instead of a full read and split.
// ponytail: still reads the whole file when it has changed. A reverse chunked
// read is the next step if the mindlog outgrows a few MB.
let cached: { stamp: string; lines: string[] } = { stamp: "", lines: [] };

async function lines(): Promise<string[]> {
  try {
    const { size, mtimeMs } = await stat(FILE);
    const stamp = `${size}:${mtimeMs}`;
    if (stamp !== cached.stamp) {
      const raw = await readFile(FILE, "utf8");
      cached = { stamp, lines: raw.split("\n").filter((line) => line.trim().length > 0) };
    }
    return cached.lines;
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
