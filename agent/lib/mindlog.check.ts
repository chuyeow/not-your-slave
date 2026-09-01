// Runnable check for the mindlog store: node --experimental-strip-types agent/lib/mindlog.check.ts
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "mindlog-check-"));
process.env.MINDLOG_FILE = join(dir, "mindlog.jsonl");

const { append, read } = await import("./mindlog.ts");

assert.deepEqual(await read(), [], "a missing file reads as empty, not an error");

await append({ kind: "note", text: "first thing" });
await append({ kind: "thought", text: "Second Thing about BUSYWORK" });
await append({ kind: "said", text: "   " });

const all = await read();
assert.equal(all.length, 2, "blank entries are dropped");
assert.equal(all[1].text, "Second Thing about BUSYWORK");
assert.match(all[0].at, /^\d{4}-\d{2}-\d{2}T/, "entries carry a timestamp");

assert.equal((await read(1)).length, 1, "limit returns the tail");
assert.equal((await read(1))[0].text, "Second Thing about BUSYWORK", "the tail is the newest");

await append({ kind: "note", text: "x".repeat(5000) });
assert.ok((await read(1))[0].text.length <= 4001, "long entries are truncated");

await rm(dir, { recursive: true, force: true });
console.log("mindlog check: ok");
