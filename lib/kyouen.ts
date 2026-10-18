// 共円の判定（kyouen-rules.md の「判定の方法」）。格子点の座標は整数なので、整数だけで計算する

import { parsePointKey, pointKey } from "./operations";

export type Point = { x: number; y: number };

// a(x²+y²) + bx + cy + d = 0 の係数。a が 0 なら直線
export type Curve = { a: number; b: number; c: number; d: number };

export type Kyouen = { curve: Curve; points: Point[] };

function det3(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}

// 3つの格子点を通る円か直線。判定の行列式を1行目で展開した係数を、互いに素で先頭が正になるようにそろえる
export function curveThrough(p: Point, q: Point, r: Point): Curve | null {
  const rows = [p, q, r].map(({ x, y }) => ({ s: x * x + y * y, x, y }));
  const a = det3(rows.map(({ x, y }) => [x, y, 1]));
  const b = -det3(rows.map(({ s, y }) => [s, y, 1]));
  const c = det3(rows.map(({ s, x }) => [s, x, 1]));
  const d = -det3(rows.map(({ s, x, y }) => [s, x, y]));
  const g = [a, b, c, d].reduce(gcd);
  // 同じ格子点を含むときは、円も直線も決まらない
  if (g === 0) return null;
  const first = [a, b, c, d].find((v) => v !== 0)!;
  const sign = first > 0 ? 1 : -1;
  // + 0 で -0 を 0 にそろえる
  return { a: (a / g) * sign + 0, b: (b / g) * sign + 0, c: (c / g) * sign + 0, d: (d / g) * sign + 0 };
}

export function isOnCurve({ a, b, c, d }: Curve, { x, y }: Point): boolean {
  return a * (x * x + y * y) + b * x + c * y + d === 0;
}

function curveKey({ a, b, c, d }: Curve): string {
  return `${a},${b},${c},${d}`;
}

// 3つ以上の石を通る円と直線を、通る石と合わせて返す
export function curvesThroughStones(stones: Iterable<string>, minPoints: number): Kyouen[] {
  const points = [...stones].map(parsePointKey);
  const found = new Map<string, { curve: Curve; indices: Set<number> }>();
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const curve = curveThrough(points[i], points[j], points[k]);
        if (!curve) continue;
        const key = curveKey(curve);
        const entry = found.get(key) ?? { curve, indices: new Set<number>() };
        entry.indices.add(i).add(j).add(k);
        found.set(key, entry);
      }
    }
  }
  return [...found.values()]
    .filter(({ indices }) => indices.size >= minPoints)
    .map(({ curve, indices }) => ({ curve, points: [...indices].map((i) => points[i]) }));
}

// 盤面にできている共円。4つ以上の石を通る円と直線
export function findKyouen(stones: Iterable<string>): Kyouen[] {
  return curvesThroughStones(stones, 4);
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

// 石を置ける場所。石のない格子点のうち、3つ以上の石を通る円と直線のどれの上にもないもの（safe-points.md）
export function findSafePoints(size: number, stones: ReadonlySet<string>): Point[] {
  const curves = curvesThroughStones(stones, 3).map(({ curve }) => curve);
  const safe: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (stones.has(pointKey(x, y))) continue;
      if (!curves.some((curve) => isOnCurve(curve, { x, y }))) safe.push({ x, y });
    }
  }
  return safe;
}
