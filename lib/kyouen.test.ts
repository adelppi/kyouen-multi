import { describe, expect, it } from "vitest";
import { circleOf, clipLine, curveThrough, findKyouen, findSafePoints, isOnCurve } from "./kyouen";
import { pointKey } from "./operations";

const keys = (...points: [number, number][]) => points.map(([x, y]) => pointKey(x, y));

describe("curveThrough", () => {
  it("同じ円を通る3点からは、どの3点を選んでも同じ係数になる", () => {
    const square = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 4 },
      { x: 1, y: 4 },
    ];
    const a = curveThrough(square[0], square[1], square[2]);
    const b = curveThrough(square[3], square[2], square[0]);
    expect(a).toEqual(b);
    expect(isOnCurve(a!, square[3])).toBe(true);
  });

  it("直線の上の3点からは、a が 0 の係数になる", () => {
    const line = curveThrough({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 4 });
    expect(line?.a).toBe(0);
    expect(isOnCurve(line!, { x: 3, y: 6 })).toBe(true);
    expect(isOnCurve(line!, { x: 3, y: 5 })).toBe(false);
  });

  it("同じ格子点を含むときは null", () => {
    expect(curveThrough({ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 3 })).toBeNull();
  });
});

describe("findKyouen", () => {
  it("4つの石が同じ円の上にあると、その円を返す", () => {
    const result = findKyouen(keys([1, 1], [3, 1], [3, 4], [1, 4], [6, 6]));
    expect(result).toHaveLength(1);
    expect(result[0].points).toHaveLength(4);
    const circle = circleOf(result[0].curve)!;
    expect(circle.cx).toBe(2);
    expect(circle.cy).toBe(2.5);
    expect(circle.r).toBeCloseTo(Math.hypot(1, 1.5));
  });

  it("4つの石が同じ直線の上にあると、その直線を返す", () => {
    const result = findKyouen(keys([0, 0], [1, 1], [2, 2], [5, 5], [0, 3]));
    expect(result).toHaveLength(1);
    expect(result[0].curve.a).toBe(0);
    expect(circleOf(result[0].curve)).toBeNull();
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

describe("clipLine", () => {
  it("直線の、盤面の中にある部分の両端を返す", () => {
    const line = curveThrough({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })!;
    const ends = clipLine(line, 0, 8)!;
    expect(ends).toHaveLength(2);
    expect(ends.map((e) => e.x).sort()).toEqual([0, 8]);
  });

  it("縦と横の直線も返す", () => {
    const vertical = curveThrough({ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 })!;
    expect(clipLine(vertical, 0, 8)!.map((e) => e.x)).toEqual([3, 3]);
    const horizontal = curveThrough({ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 5, y: 2 })!;
    expect(clipLine(horizontal, 0, 8)!.map((e) => e.y)).toEqual([2, 2]);
  });
});

describe("findSafePoints", () => {
  const has = (points: { x: number; y: number }[], x: number, y: number) => points.some((p) => p.x === x && p.y === y);

  it("石が2つ以下なら、石のない格子点はすべて置ける", () => {
    const stones = new Set(keys([0, 0], [1, 1]));
    expect(findSafePoints(5, stones)).toHaveLength(25 - 2);
  });

  it("置くと共円ができる格子点は置けない", () => {
    // (1,1)、(3,1)、(3,4) に置くと、(1,4) で長方形の共円になる。(0,0)、(1,0)、(2,0) の直線の上も置けない
    const safe = findSafePoints(9, new Set(keys([1, 1], [3, 1], [3, 4])));
    expect(has(safe, 1, 4)).toBe(false);
    const line = findSafePoints(9, new Set(keys([0, 0], [1, 0], [2, 0])));
    expect(has(line, 5, 0)).toBe(false);
    expect(has(line, 5, 1)).toBe(true);
  });

  it("すでにできている共円の上の格子点も置けない", () => {
    const safe = findSafePoints(9, new Set(keys([0, 0], [1, 0], [2, 0], [3, 0])));
    expect(has(safe, 4, 0)).toBe(false);
  });

  it("石のある格子点は返さない", () => {
    const safe = findSafePoints(5, new Set(keys([2, 2])));
    expect(has(safe, 2, 2)).toBe(false);
  });

  it("置ける場所に置いても共円はできず、ほかの石のない格子点に置くと共円ができる", () => {
    const stones = new Set(keys([1, 1], [3, 1], [3, 4], [6, 2], [0, 7]));
    expect(findKyouen(stones)).toEqual([]);
    const safe = findSafePoints(9, stones);
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (stones.has(pointKey(x, y))) continue;
        const kyouen = findKyouen([...stones, pointKey(x, y)]);
        expect(kyouen.length === 0).toBe(has(safe, x, y));
      }
    }
  });
});
