import { describe, expect, it } from "vitest";
import { stepToward } from "./cursor";

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
