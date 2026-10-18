import { describe, expect, it } from "vitest";
import { pruneTrail, stepToward, TRAIL_MS, trailOpacity } from "./cursor";

describe("stepToward", () => {
  it("受け取った位置へ少しずつ近づき、最後は受け取った位置に合う", () => {
    const target = { x: 4, y: 2 };
    let position = { x: 0, y: 0 };
    let previous = Infinity;
    for (let i = 0; i < 100 && position !== target; i++) {
      position = stepToward(position, target);
      const distance = Math.hypot(target.x - position.x, target.y - position.y);
      expect(distance).toBeLessThan(previous);
      previous = distance;
    }
    expect(position).toEqual(target);
  });
});

describe("軌跡", () => {
  it("古い部分から消える", () => {
    const trail = [
      { x: 0, y: 0, t: 0 },
      { x: 1, y: 0, t: 300 },
      { x: 2, y: 0, t: 500 },
    ];
    expect(pruneTrail(trail, TRAIL_MS + 100).map((p) => p.x)).toEqual([1, 2]);
  });

  it("古い部分ほど薄い", () => {
    const now = 500;
    expect(trailOpacity({ x: 0, y: 0, t: 500 }, now)).toBe(1);
    expect(trailOpacity({ x: 0, y: 0, t: 200 }, now)).toBeLessThan(trailOpacity({ x: 0, y: 0, t: 400 }, now));
    expect(trailOpacity({ x: 0, y: 0, t: now - TRAIL_MS }, now)).toBe(0);
  });
});
