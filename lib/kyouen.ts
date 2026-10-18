// 共円の判定と、石を置ける場所の計算（kyouen-display.md、safe-points.md）
// 判定と計算はプレースホルダーで、ほかの開発メンバーが作る。これまでの実装の方法は D-0012 にある

export type Point = { x: number; y: number };

// a(x²+y²) + bx + cy + d = 0 の係数。a が 0 なら直線
export type Curve = { a: number; b: number; c: number; d: number };

// 共円になっている円か直線と、その上にある石の格子点
export type Kyouen = { curve: Curve; points: Point[] };

// 盤面にできている共円。4つ以上の石を通る円と直線を返す。stones は石のある格子点のキー（"x,y"）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function findKyouen(stones: Iterable<string>): Kyouen[] {
  // TODO: 判定のアルゴリズムを作る
  return [];
}

// 石を置ける場所。石のない格子点のうち、置いても共円ができないものを返す（D-0010）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function findSafePoints(size: number, stones: ReadonlySet<string>): Point[] {
  // TODO: 計算のアルゴリズムを作る
  return [];
}

// 円の中心と半径。直線のときは null
export function circleOf({ a, b, c, d }: Curve): { cx: number; cy: number; r: number } | null {
  if (a === 0) return null;
  const cx = -b / (2 * a);
  const cy = -c / (2 * a);
  return { cx, cy, r: Math.sqrt(cx * cx + cy * cy - d / a) };
}

// 直線 bx + cy + d = 0 のうち、正方形 [min, max]² の中にある部分の両端
export function clipLine({ b, c, d }: Curve, min: number, max: number): [Point, Point] | null {
  const ends: Point[] = [];
  const add = (x: number, y: number) => {
    const eps = 1e-9;
    if (x < min - eps || x > max + eps || y < min - eps || y > max + eps) return;
    if (!ends.some((e) => Math.abs(e.x - x) < eps && Math.abs(e.y - y) < eps)) ends.push({ x, y });
  };
  if (c !== 0) {
    add(min, -(b * min + d) / c);
    add(max, -(b * max + d) / c);
  }
  if (b !== 0) {
    add(-(c * min + d) / b, min);
    add(-(c * max + d) / b, max);
  }
  return ends.length >= 2 ? [ends[0], ends[1]] : null;
}
