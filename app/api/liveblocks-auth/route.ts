import { type NextRequest } from "next/server";
import { liveblocks } from "@/lib/liveblocks-server";
import { EMPTY_SINCE_KEY, isValidRoomId, shouldDeleteRoom } from "@/lib/room";

const USER_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const { room, userId } = (body ?? {}) as { room?: unknown; userId?: unknown };
  if (!isValidRoomId(room) || typeof userId !== "string" || !USER_ID_PATTERN.test(userId)) {
    return new Response("Bad Request", { status: 400 });
  }

  const client = liveblocks();
  await deleteRoomIfExpired(room);

  const session = client.prepareSession(userId);
  session.allow(room, session.FULL_ACCESS);
  const { status, body: token } = await session.authorize();
  return new Response(token, { status });
}

// 全員が抜けてから5分を過ぎた部屋は、入る前に消す（D-0008）
async function deleteRoomIfExpired(roomId: string) {
  const client = liveblocks();
  const room = await client.getRoom(roomId).catch(() => null);
  if (!room) return;
  const emptySince = room.metadata[EMPTY_SINCE_KEY];
  if (typeof emptySince !== "string") return;
  const { data: users } = await client.getActiveUsers(roomId);
  if (shouldDeleteRoom(emptySince, users.length, Date.now())) {
    await client.deleteRoom(roomId);
  }
}
