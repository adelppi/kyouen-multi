import { describe, expect, it } from "vitest";
import { circleOf, clipLine, findKyouen, findSafePoints } from "./kyouen";
import { pointKey } from "./operations";

const keys = (...points: [number, number][]) => points.map(([x, y]) => pointKey(x, y));

describe("プレースホルダー", () => {
  it("判定と計算は空の結果を返す", () => {
    expect(findKyouen(keys([1, 1], [3, 1], [3, 4], [1, 4]))).toEqual([]);
    expect(findSafePoints(9, new Set(keys([0, 0])))).toEqual([]);
  });
});

// 判定と計算を作ったら、skip を外して確かめる（kyouen-display.md、safe-points.md の受け入れ条件）
describe.skip("findKyouen", () => {
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

describe.skip("findSafePoints", () => {
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
