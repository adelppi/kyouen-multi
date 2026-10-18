import { WebhookHandler } from "@liveblocks/node";
import { type NextRequest } from "next/server";
import { liveblocks } from "@/lib/liveblocks-server";
import { EMPTY_SINCE_KEY } from "@/lib/room";

// 部屋が空になった時刻を、部屋のメタデータに残す（D-0008）
export async function POST(request: NextRequest) {
  const secret = process.env.LIVEBLOCKS_WEBHOOK_SECRET;
  if (!secret) return new Response("Not configured", { status: 500 });

  let event;
  try {
    event = new WebhookHandler(secret).verifyRequest({
      headers: request.headers,
      rawBody: await request.text(),
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const client = liveblocks();
  if (event.type === "userLeft" && event.data.numActiveUsers === 0) {
    await client.updateRoom(event.data.roomId, {
      metadata: { [EMPTY_SINCE_KEY]: event.data.leftAt },
    });
  } else if (event.type === "userEntered") {
    await client.updateRoom(event.data.roomId, {
      metadata: { [EMPTY_SINCE_KEY]: null },
    });
  }
  return new Response(null, { status: 204 });
}
