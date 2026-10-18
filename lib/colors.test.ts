import { describe, expect, it } from "vitest";
import { colorForConnection, PARTICIPANT_COLORS } from "./colors";

describe("colorForConnection", () => {
  it("続けて入った参加者には違う色を割り当てる", () => {
    const colors = PARTICIPANT_COLORS.map((_, i) => colorForConnection(i + 1));
    expect(new Set(colors).size).toBe(PARTICIPANT_COLORS.length);
  });

  it("色の並びを使い切ったら、初めから使う", () => {
    expect(colorForConnection(PARTICIPANT_COLORS.length + 1)).toBe(
      colorForConnection(1),
    );
  });
});
