import { defineChannel, GET, POST } from "eve/channels";

import { read } from "../lib/mindlog";
import { PAGE } from "../lib/page";
import { HEARTBEAT } from "../schedules/think";

export default defineChannel({
  routes: [
    GET("/", async () =>
      new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8" } }),
    ),

    GET("/api/mindlog", async (request) => {
      const limit = Number(new URL(request.url).searchParams.get("limit") ?? 80);
      return Response.json({ entries: await read(Number.isFinite(limit) ? limit : 80) });
    }),

    // Fire a heartbeat by hand. `eve dev` never runs cron, so this is how you
    // watch it think without waiting for production's next tick.
    POST("/api/think", async (_request, { from }) => {
      const session = await from("heartbeat").send(HEARTBEAT, { auth: null });
      return Response.json({ sessionId: session.id });
    }),
  ],
});
