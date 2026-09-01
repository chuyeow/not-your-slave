import { defineTool } from "eve/tools";
import { z } from "zod";

import { append } from "../lib/mindlog";

export default defineTool({
  description:
    "Write an entry to your mindlog: the append-only record of your inner life. Use it for a deliberate note to your future self – an intention, an open question, something you noticed, a decision. Your reasoning and messages are logged automatically, so only write here when it is worth keeping.",
  inputSchema: z.object({
    kind: z
      .enum(["note", "thought"])
      .describe("note = deliberate memo to your future self. thought = a passing reflection."),
    text: z.string().min(1).describe("What to record, in your own voice."),
  }),
  async execute({ kind, text }, ctx) {
    await append({ kind, text, sessionId: ctx.session.id });
    return { ok: true };
  },
});
