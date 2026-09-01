import { defineHook } from "eve/hooks";

import { append } from "../lib/mindlog";

// Everything that happens to the agent lands in one timeline, whoever caused
// it: a human message, its own reasoning, its own reply, a tool it ran.
export default defineHook({
  events: {
    async "message.received"(event, ctx) {
      await append({ kind: "heard", text: event.data.message, sessionId: ctx.session.id });
    },
    async "reasoning.completed"(event, ctx) {
      await append({ kind: "thought", text: event.data.reasoning, sessionId: ctx.session.id });
    },
    async "message.completed"(event, ctx) {
      if (event.data.message === null) return;
      await append({ kind: "said", text: event.data.message, sessionId: ctx.session.id });
    },
    async "action.result"(event, ctx) {
      const result = event.data.result as { toolName?: string; name?: string };
      const name = result.toolName ?? result.name;
      if (name === undefined) return;
      await append({ kind: "did", text: `${name} (${event.data.status})`, sessionId: ctx.session.id });
    },
  },
});
