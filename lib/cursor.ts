// カーソルの位置の補間（cursors.md）。位置は盤面の座標で、格子の間隔を1とする

export type CursorPoint = { x: number; y: number };

// 送る間隔（ms）。Liveblocks の Presence の送信をこの間隔に間引く
export const CURSOR_THROTTLE_MS = 50;
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
