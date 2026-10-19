import { describe, expect, it } from "vitest";
import { circleOf, clipLine, createKyouenAnalyzer, findKyouen, findSafePoints, type Kyouen, type Point } from "./kyouen";
import { pointKey } from "./operations";

const keys = (...points: [number, number][]) => points.map(([x, y]) => pointKey(x, y));

const pointNames = (points: Point[]) => points.map(({ x, y }) => pointKey(x, y)).sort();
const groups = (result: Kyouen[]) => result.map(({ points }) => pointNames(points).join(";")).sort();
const parsePoints = (stones: Iterable<string>): Point[] => [...new Set(stones)].map((key) => {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
});

// 実装の円の係数を使わず、4点の行列式で判定する。
function determinant(matrix: number[][]): number {
  if (matrix.length === 1) return matrix[0][0];
  return matrix[0].reduce((sum, value, column) => sum + (-1) ** column * value * determinant(
    matrix.slice(1).map((row) => row.filter((_, index) => index !== column)),
  ), 0);
}

function sameCurve(a: Point, b: Point, c: Point, d: Point): boolean {
  return determinant([a, b, c, d].map(({ x, y }) => [x * x + y * y, x, y, 1])) === 0;
}

function oracleGroups(stones: Iterable<string>): string[] {
  const points = parsePoints(stones);
  const found = new Set<string>();
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const onCurve = points.filter((point) => sameCurve(points[i], points[j], points[k], point));
        if (onCurve.length >= 4) found.add(pointNames(onCurve).join(";"));
      }
    }
  }
  return [...found].sort();
}

function oracleSafe(size: number, stones: ReadonlySet<string>): string[] {
  const points = parsePoints(stones);
  const safe: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (stones.has(pointKey(x, y))) continue;
      const candidate = { x, y };
      let forbidden = false;
      for (let i = 0; i < points.length && !forbidden; i++) {
        for (let j = i + 1; j < points.length && !forbidden; j++) {
          for (let k = j + 1; k < points.length; k++) {
            if (sameCurve(points[i], points[j], points[k], candidate)) {
              forbidden = true;
              break;
            }
          }
        }
      }
      if (!forbidden) safe.push(candidate);
    }
  }
  return pointNames(safe);
}

function expectCurves(result: Kyouen[], stones: Iterable<string>) {
  expect(groups(result)).toEqual(oracleGroups(stones));
  for (const { curve, points } of result) {
    expect(Object.values(curve).every(Number.isSafeInteger)).toBe(true);
    expect([curve.a, curve.b, curve.c].some((value) => value !== 0)).toBe(true);
    expect(new Set(pointNames(points)).size).toBe(points.length);
    for (const { x, y } of points) {
      const residual = curve.a * (x * x + y * y) + curve.b * x + curve.c * y + curve.d;
      expect(residual).toBe(0);
    }
  }
}

describe("findKyouen", () => {
  it("4つの石が同じ円の上にあると、その円を返す", () => {
    const result = findKyouen(keys([1, 1], [3, 1], [3, 4], [1, 4], [6, 6]));
    expect(result).toHaveLength(1);
    expect(result[0].points).toHaveLength(4);
    const circle = circleOf(result[0].curve)!;
    expect(circle.cx).toBeCloseTo(2);
    expect(circle.cy).toBeCloseTo(2.5);
    expect(circle.r).toBeCloseTo(Math.hypot(1, 1.5));
  });

  it("4つの石が同じ直線の上にあると、その直線を返す", () => {
    const result = findKyouen(keys([0, 0], [1, 1], [2, 2], [5, 5], [0, 3]));
    expect(result).toHaveLength(1);
    expect(result[0].curve.a).toBe(0);
  });

  it("等脚台形の4点は共円になる", () => {
    expect(findKyouen(keys([0, 0], [4, 0], [3, 2], [1, 2]))).toHaveLength(1);
  });

  it("共円でない並びでは何も返さない", () => {
    expect(findKyouen(keys([0, 0], [1, 0], [0, 1], [2, 3]))).toEqual([]);
    expect(findKyouen(keys([0, 0], [1, 0], [0, 1]))).toEqual([]);
  });

  it("5つの石が同じ円の上にあれば、1つの共円として返す", () => {
    // 中心 (0, 0)、半径 5 の円の上の格子点
    const result = findKyouen(keys([5, 0], [3, 4], [4, 3], [0, 5], [-3, 4]));
    expect(result).toHaveLength(1);
    expect(result[0].points).toHaveLength(5);
  });
});

describe("findSafePoints", () => {
  const has = (points: { x: number; y: number }[], x: number, y: number) => points.some((p) => p.x === x && p.y === y);

  it("石が2つ以下なら、石のない格子点はすべて置ける", () => {
    expect(findSafePoints(5, new Set(keys([0, 0], [1, 1])))).toHaveLength(25 - 2);
  });

  it("置くと共円ができる格子点は置けない", () => {
    expect(has(findSafePoints(9, new Set(keys([1, 1], [3, 1], [3, 4]))), 1, 4)).toBe(false);
    const line = findSafePoints(9, new Set(keys([0, 0], [1, 0], [2, 0])));
    expect(has(line, 5, 0)).toBe(false);
    expect(has(line, 5, 1)).toBe(true);
  });

  it("すでにできている共円の上の格子点も置けない", () => {
    expect(has(findSafePoints(9, new Set(keys([0, 0], [1, 0], [2, 0], [3, 0]))), 4, 0)).toBe(false);
  });

  it("石のある格子点は返さない", () => {
    expect(has(findSafePoints(5, new Set(keys([2, 2]))), 2, 2)).toBe(false);
  });

  it("置ける場所に置いても共円はできず、ほかの石のない格子点に置くと共円ができる", () => {
    const stones = new Set(keys([1, 1], [3, 1], [3, 4], [6, 2], [0, 7]));
    expect(findKyouen(stones)).toEqual([]);
    const safe = findSafePoints(9, stones);
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (stones.has(pointKey(x, y))) continue;
        expect(findKyouen([...stones, pointKey(x, y)]).length === 0).toBe(has(safe, x, y));
      }
    }
  });
});

describe("判定の境界条件", () => {
  it.each([
    keys([2, 0], [2, 1], [2, 2], [2, 3], [2, 4]),
    keys([0, 2], [1, 2], [2, 2], [3, 2], [4, 2]),
    keys([0, 4], [1, 3], [2, 2], [3, 1], [4, 0]),
  ])("同じ直線の全点を1つにまとめる: %j", (...stones) => {
    const result = findKyouen(stones);
    expect(result).toHaveLength(1);
    expect(result[0].curve.a).toBe(0);
    expect(pointNames(result[0].points)).toEqual([...stones].sort());
  });

  it("最初の3点だけが同一直線上なら共円にしない", () => {
    expect(findKyouen(keys([0, 0], [1, 0], [2, 0], [0, 1]))).toEqual([]);
  });

  it("分数の外心を持つ円を正確に区別する", () => {
    const stones = keys([0, 0], [4, 0], [3, 2], [1, 2]);
    const result = findKyouen(stones);
    expect(result).toHaveLength(1);
    expect(circleOf(result[0].curve)).toEqual({ cx: 2, cy: 0.25, r: Math.sqrt(65) / 4 });
    expectCurves(result, stones);
    expect(findKyouen(keys([0, 0], [4, 0], [3, 2], [1, 3]))).toEqual([]);
  });

  it("入力順や重複で共円の集合を変えない", () => {
    const stones = keys([5, 0], [3, 4], [4, 3], [0, 5], [-3, 4]);
    const expected = [[...stones].sort().join(";")];
    expect(groups(findKyouen(stones))).toEqual(expected);
    expect(groups(findKyouen([...stones].reverse()))).toEqual(expected);
    expect(groups(findKyouen([...stones, ...stones]))).toEqual(expected);
  });

  it("複数の円と直線をそれぞれ返す", () => {
    const stones = keys([0, 0], [2, 0], [2, 2], [0, 2], [3, 0], [5, 0], [5, 2], [3, 2]);
    const expected = oracleGroups(stones);
    expect(expected).toContain(keys([0, 0], [2, 0], [2, 2], [0, 2]).sort().join(";"));
    expect(expected).toContain(keys([3, 0], [5, 0], [5, 2], [3, 2]).sort().join(";"));
    expectCurves(findKyouen(stones), stones);
  });

  it("空の盤面では全点を返し、空きがなければ返さない", () => {
    expect(pointNames(findSafePoints(3, new Set()))).toEqual(oracleSafe(3, new Set()));
    const full = new Set(Array.from({ length: 9 }, (_, i) => pointKey(i % 3, Math.floor(i / 3))));
    expect(findSafePoints(3, full)).toEqual([]);
  });

  it("既存の共円と無関係な空き点は置ける", () => {
    const stones = new Set(keys([0, 0], [1, 0], [2, 0], [3, 0]));
    const safe = pointNames(findSafePoints(5, stones));
    expect(safe).toContain("0,1");
    expect(safe).not.toContain("4,0");
    expect(safe).toEqual(oracleSafe(5, stones));
  });
});

describe("createKyouenAnalyzer", () => {
  it.each([
    { name: "円", stones: keys([0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [2, 3]) },
    { name: "直線", stones: keys([0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]) },
  ])("同じ$name上の5点目と6点目を、既存の共円にまとめる", ({ stones }) => {
    const analyzer = createKyouenAnalyzer();
    const current = new Set(stones.slice(0, 4));
    const first = analyzer.findKyouen(current);
    expect(first).toHaveLength(1);
    expectCurves(first, current);
    const snapshot = structuredClone(first);
    for (const stone of stones.slice(4)) {
      current.add(stone);
      const result = analyzer.findKyouen(current);
      expect(result).toHaveLength(1);
      expect(pointNames(result[0].points)).toEqual([...current].sort());
      expectCurves(result, current);
      expect(first).toEqual(snapshot);
    }
  });

  it("追加、削除、複数変更、復元、サイズ変更を独立した判定と照合する", () => {
    const analyzer = createKyouenAnalyzer();
    let seed = 0x12345678;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };
    let size = 4;
    const stones = new Set<string>();
    const saved = new Set(keys([0, 0], [1, 0], [2, 0], [3, 0], [1, 1]));
    for (let step = 0; step < 36; step++) {
      if (step === 12 || step === 24) {
        size = step === 12 ? 5 : 4;
        stones.clear();
        for (const stone of saved) stones.add(stone);
      } else if (step % 9 === 0) {
        stones.clear();
        for (const stone of saved) stones.add(stone);
      } else {
        const count = step % 4 === 0 ? 3 : 1;
        for (let change = 0; change < count; change++) {
          const key = pointKey(random() % size, (random() >>> 8) % size);
          if (stones.has(key)) stones.delete(key);
          else stones.add(key);
        }
      }
      const input = step % 2 === 0 ? [...stones] : [...stones].reverse();
      expectCurves(analyzer.findKyouen(input), stones);
      expect(pointNames(analyzer.findSafePoints(size, stones))).toEqual(oracleSafe(size, stones));
      expectCurves(findKyouen(input), stones);
      expect(pointNames(findSafePoints(size, stones))).toEqual(oracleSafe(size, stones));
    }
  });

  it("同じSetの変更と、各APIを別の順で呼ぶ場合も追従する", () => {
    const analyzer = createKyouenAnalyzer();
    const stones = new Set(keys([0, 0], [2, 0], [0, 2]));
    for (const key of ["2,2", "1,0", "2,2", "1,1", "0,2", "0,2"]) {
      if (stones.has(key)) stones.delete(key);
      else stones.add(key);
      expect(pointNames(analyzer.findSafePoints(4, stones))).toEqual(oracleSafe(4, stones));
      expectCurves(analyzer.findKyouen([...stones, ...stones]), stones);
    }
  });

  it("2つの計算器の状態と、返した結果を後続の呼び出しで変えない", () => {
    const first = createKyouenAnalyzer();
    const second = createKyouenAnalyzer();
    const stones = new Set(keys([0, 0], [2, 0], [2, 2], [0, 2]));
    const curves = first.findKyouen(stones);
    const safe = first.findSafePoints(4, stones);
    expect(curves).toHaveLength(1);
    expect(safe.length).toBeGreaterThan(0);
    const snapshot = structuredClone({ curves, safe });
    expectCurves(second.findKyouen(keys([0, 0], [1, 0], [2, 0], [3, 0])), keys([0, 0], [1, 0], [2, 0], [3, 0]));
    expect(second.findSafePoints(2, new Set())).toHaveLength(4);
    stones.add("1,0");
    first.findKyouen(stones);
    first.findSafePoints(5, stones);
    first.findKyouen([]);
    first.findSafePoints(3, new Set());
    expect({ curves, safe }).toEqual(snapshot);
    expectCurves(second.findKyouen(keys([0, 0], [1, 0], [2, 0], [3, 0])), keys([0, 0], [1, 0], [2, 0], [3, 0]));
    expectCurves(first.findKyouen(stones), stones);
    expect(pointNames(first.findSafePoints(4, stones))).toEqual(oracleSafe(4, stones));
  });
});

describe("circleOf", () => {
  it("円の係数から中心と半径を返し、直線なら null", () => {
    // x² + y² − 4x − 5y + 4 = 0 は、中心 (2, 2.5) の円
    expect(circleOf({ a: 1, b: -4, c: -5, d: 4 })).toEqual({ cx: 2, cy: 2.5, r: Math.sqrt(4 + 6.25 - 4) });
    expect(circleOf({ a: 0, b: 1, c: -1, d: 0 })).toBeNull();
  });
});

describe("clipLine", () => {
  it("直線の、盤面の中にある部分の両端を返す", () => {
    // x − y = 0
    const ends = clipLine({ a: 0, b: 1, c: -1, d: 0 }, 0, 8)!;
    expect(ends.map((e) => e.x).sort()).toEqual([0, 8]);
  });

  it("縦と横の直線も返す", () => {
    // x = 3 と y = 2
    expect(clipLine({ a: 0, b: 1, c: 0, d: -3 }, 0, 8)!.map((e) => e.x)).toEqual([3, 3]);
    expect(clipLine({ a: 0, b: 0, c: 1, d: -2 }, 0, 8)!.map((e) => e.y)).toEqual([2, 2]);
  });
});
