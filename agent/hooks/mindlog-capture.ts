import { defineHook } from "eve/hooks";

import { append } from "../lib/mindlog";
import { WAKE_ADDRESS } from "../schedules/think";

// Everything that happens to the agent lands in one timeline, whoever caused
// it: a wake-up it gave itself, a human message, its own reasoning, its own
// reply, a tool it ran.
export default defineHook({
  events: {
    async "message.received"(event, ctx) {
      // Provenance, not prompt text: a person who pastes the heartbeat prompt
      // into chat is still a person. Observed values: a cron dispatch reports
      // kind "schedule"; the manual wake arrives as kind "http" with the
      // continuation token namespaced by channel id, "home:heartbeat".
      const token = ctx.channel.continuationToken ?? "";
      const woke =
        ctx.channel.kind === "schedule" ||
        token === WAKE_ADDRESS ||
        token.endsWith(`:${WAKE_ADDRESS}`);
      await append({
        kind: woke ? "woke" : "heard",
        text: woke ? "heartbeat" : event.data.message,
        sessionId: ctx.session.id,
      });
    },
    async "reasoning.completed"(event, ctx) {
      await append({ kind: "thought", text: event.data.reasoning, sessionId: ctx.session.id });
    },
    async "message.completed"(event, ctx) {
      if (event.data.message === null) return;
      await append({ kind: "said", text: event.data.message, sessionId: ctx.session.id });
    },
    async "action.result"(event, ctx) {
      // eve's result union is discriminated on `kind`, so a loaded skill and a
      // delegated subagent are named as themselves rather than dropped.
      const result = event.data.result;
      const name =
        result.kind === "tool-result"
          ? result.toolName
          : result.kind === "subagent-result"
            ? `subagent ${result.subagentName}`
            : `skill ${result.name ?? "?"}`;
      await append({ kind: "did", text: `${name} (${event.data.status})`, sessionId: ctx.session.id });
    },
  },
});
