// 共円の判定と、石を置ける場所の計算（kyouen-display.md、safe-points.md）
// 外心の式を整数で扱い、同じ円や直線になる3点組をまとめる（D-0014）

export type Point = { x: number; y: number };

// a(x²+y²) + bx + cy + d = 0 の係数。a が 0 なら直線
export type Curve = { a: number; b: number; c: number; d: number };

// 共円になっている円か直線と、その上にある石の格子点
export type Kyouen = { curve: Curve; points: Point[] };

// 盤面にできている共円。4つ以上の石を通る円と直線を返す。stones は石のある格子点のキー（"x,y"）
export function findKyouen(stones: Iterable<string>): Kyouen[] {
  return createKyouenAnalyzer().findKyouen(stones);
}

// 石を置ける場所。石のない格子点のうち、置いても共円ができないものを返す（D-0010）
export function findSafePoints(size: number, stones: ReadonlySet<string>): Point[] {
  return createKyouenAnalyzer().findSafePoints(size, stones);
}

function gcd(left: number, right: number): number {
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function normalize(a: number, b: number, c: number, d: number): Curve {
  const divisor = gcd(gcd(Math.abs(a), Math.abs(b)), gcd(Math.abs(c), Math.abs(d)));
  const sign = (a || b || c || d) < 0 ? -1 : 1;
  const scale = divisor * sign;
  // -0 も 0 にそろえる。
  return { a: a / scale || 0, b: b / scale || 0, c: c / scale || 0, d: d / scale || 0 };
}

function curveThrough(first: Point, second: Point, third: Point): Curve {
  const ux = second.x - first.x;
  const uy = second.y - first.y;
  const vx = third.x - first.x;
  const vy = third.y - first.y;
  const cross = ux * vy - uy * vx;
  if (cross === 0) return normalize(0, uy, -ux, ux * first.y - uy * first.x);

  // 外心を first + (nx, ny) / (2 * cross) として、分母を払う。
  const uSquared = ux * ux + uy * uy;
  const vSquared = vx * vx + vy * vy;
  const nx = uSquared * vy - vSquared * uy;
  const ny = ux * vSquared - vx * uSquared;
  return normalize(
    cross,
    -nx - 2 * cross * first.x,
    -ny - 2 * cross * first.y,
    cross * (first.x * first.x + first.y * first.y) + nx * first.x + ny * first.y,
  );
}

function curveKey({ a, b, c, d }: Curve): string {
  return `${a},${b},${c},${d}`;
}

function pointKey({ x, y }: Point): string {
  return `${x},${y}`;
}

function pointsOf(stones: ReadonlySet<string>): Point[] {
  return [...stones].map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  });
}

type Bucket = { curve: Curve; points: Point[] };

// 固定した2点から作る曲線だけを、一時的に保持する。
function collectPair(
  first: Point,
  second: Point,
  remaining: Point[],
  start: number,
  results: Map<string, Kyouen>,
  updatedCurves?: Set<string>,
) {
  const buckets = new Map<string, Bucket>();
  for (let index = start; index < remaining.length; index++) {
    const third = remaining[index];
    const curve = curveThrough(first, second, third);
    const key = curveKey(curve);
    const existing = results.get(key);
    if (existing) {
      // 増分計算の first は追加点。既存の曲線には1回だけ追加する。
      if (updatedCurves && !updatedCurves.has(key)) {
        results.set(key, { curve: existing.curve, points: [...existing.points, first] });
        updatedCurves.add(key);
      }
      continue;
    }
    const bucket = buckets.get(key);
    if (bucket) bucket.points.push(third);
    else buckets.set(key, { curve, points: [third] });
  }
  for (const [key, bucket] of buckets) {
    if (bucket.points.length < 2) continue;
    // 最初に見つかる組には、その曲線上の全点がそろっている。
    results.set(key, { curve: bucket.curve, points: [first, second].concat(bucket.points) });
    updatedCurves?.add(key);
  }
}

function buildKyouen(points: Point[]): Map<string, Kyouen> {
  const results = new Map<string, Kyouen>();
  for (let first = 0; first < points.length - 3; first++) {
    for (let second = first + 1; second < points.length - 2; second++) {
      collectPair(points[first], points[second], points, second + 1, results);
    }
  }
  return results;
}

function hasRepeatedCurve(first: Point, second: Point, remaining: Point[], start: number): boolean {
  const seen = new Set<string>();
  for (let index = start; index < remaining.length; index++) {
    const key = curveKey(curveThrough(first, second, remaining[index]));
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function isSafe(point: Point, stones: Point[]): boolean {
  for (let first = 0; first < stones.length - 2; first++) {
    if (hasRepeatedCurve(point, stones[first], stones, first + 1)) return false;
  }
  return true;
}

function buildSafePoints(size: number, stones: ReadonlySet<string>, points: Point[]): Point[] {
  const safe: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const point = { x, y };
      if (!stones.has(pointKey(point)) && isSafe(point, points)) safe.push(point);
    }
  }
  return safe;
}

// 同じ盤面か、以前の石をすべて残して1点だけ増えた盤面かを調べる。
function compareStones(previous: ReadonlySet<string> | undefined, current: ReadonlySet<string>) {
  if (!previous || current.size < previous.size || current.size > previous.size + 1) return { same: false };
  for (const key of previous) if (!current.has(key)) return { same: false };
  if (current.size === previous.size) return { same: true };
  for (const key of current) {
    if (!previous.has(key)) return { same: false, added: pointsOf(new Set([key]))[0] };
  }
  return { same: false };
}

// 表示ごとの盤面を別々に保持し、表示しなかった間の変更も石の差から判断する。
export function createKyouenAnalyzer() {
  let kyouenStones: Set<string> | undefined;
  let kyouenByCurve = new Map<string, Kyouen>();
  let kyouen: Kyouen[] = [];
  let safeStones: Set<string> | undefined;
  let safeSize: number | undefined;
  let safePoints: Point[] = [];

  return {
    findKyouen(stones: Iterable<string>): Kyouen[] {
      const current = new Set(stones);
      const change = compareStones(kyouenStones, current);
      if (change.same) return kyouen;
      if (change.added && kyouenStones) {
        const previous = pointsOf(kyouenStones);
        const updatedCurves = new Set<string>();
        for (let first = 0; first < previous.length - 2; first++) {
          collectPair(change.added, previous[first], previous, first + 1, kyouenByCurve, updatedCurves);
        }
      } else {
        kyouenByCurve = buildKyouen(pointsOf(current));
      }
      kyouenStones = current;
      kyouen = [...kyouenByCurve.values()];
      return kyouen;
    },
    findSafePoints(size: number, stones: ReadonlySet<string>): Point[] {
      const current = new Set(stones);
      const change = compareStones(safeStones, current);
      if (safeSize === size && change.same) return safePoints;
      if (safeSize === size && change.added && safeStones) {
        const added = change.added;
        const previous = pointsOf(safeStones);
        safePoints = safePoints.filter(
          (point) => !current.has(pointKey(point)) && !hasRepeatedCurve(added, point, previous, 0),
        );
      } else {
        safePoints = buildSafePoints(size, current, pointsOf(current));
      }
      safeStones = current;
      safeSize = size;
      return safePoints;
    },
  };
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
