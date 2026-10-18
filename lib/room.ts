// 部屋 ID と、空いた部屋を消すかどうかの判定（D-0007、D-0008）

export const ROOM_ID_PATTERN = /^[a-z0-9]{10}$/;

// 全員が抜けてから部屋を消すまでの待ち時間
export const EMPTY_GRACE_MS = 5 * 60 * 1000;

// 部屋が空になった時刻を残す、部屋のメタデータのキー
export const EMPTY_SINCE_KEY = "emptySince";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && ROOM_ID_PATTERN.test(roomId);
}

export function shouldDeleteRoom(
  emptySince: string | string[] | undefined,
  activeUsers: number,
  now: number,
): boolean {
  if (activeUsers > 0 || typeof emptySince !== "string") return false;
  const since = Date.parse(emptySince);
  if (Number.isNaN(since)) return false;
  return now - since >= EMPTY_GRACE_MS;
}
