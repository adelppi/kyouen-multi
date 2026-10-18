// カーソルの位置の補間と軌跡（cursors.md）。位置は盤面の座標で、格子の間隔を1とする

export type CursorPoint = { x: number; y: number };
export type TrailPoint = CursorPoint & { t: number };

// 送る間隔（ms）。Liveblocks の Presence の送信をこの間隔に間引く
export const CURSOR_THROTTLE_MS = 50;
// 軌跡を残す時間（ms）。これより古い部分は消す
export const TRAIL_MS = 600;
// 1フレームで、表示している位置を受け取った位置へ近づける割合
const FOLLOW = 0.35;
// 受け取った位置とこれより近ければ、受け取った位置に合わせる
const SNAP = 0.005;

export function stepToward(from: CursorPoint, to: CursorPoint): CursorPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.hypot(dx, dy) < SNAP) return to;
  return { x: from.x + dx * FOLLOW, y: from.y + dy * FOLLOW };
}

export function pruneTrail(trail: readonly TrailPoint[], now: number): TrailPoint[] {
  return trail.filter((point) => now - point.t < TRAIL_MS);
}

// 軌跡の点の濃さ。新しいほど 1 に近く、TRAIL_MS で 0 になる
export function trailOpacity(point: TrailPoint, now: number): number {
  return Math.max(0, 1 - (now - point.t) / TRAIL_MS);
}
