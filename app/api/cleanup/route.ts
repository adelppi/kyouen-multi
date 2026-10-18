import { type NextRequest } from "next/server";
import { liveblocks } from "@/lib/liveblocks-server";
import { EMPTY_SINCE_KEY, shouldDeleteRoom } from "@/lib/room";

// 毎日1回の Vercel Cron で、全員が抜けてから5分を過ぎた部屋を消す（D-0008）
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = liveblocks();
  const now = Date.now();
  let deleted = 0;
  for await (const room of client.iterRooms({})) {
    const emptySince = room.metadata[EMPTY_SINCE_KEY];
    if (typeof emptySince !== "string") continue;
    const { data: users } = await client.getActiveUsers(room.id);
    if (shouldDeleteRoom(emptySince, users.length, now)) {
      await client.deleteRoom(room.id);
      deleted++;
    }
  }
  return Response.json({ deleted });
}
