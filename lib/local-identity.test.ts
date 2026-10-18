import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, normalizeName } from "./local-identity";

describe("normalizeName", () => {
  it("前後の空白を除く", () => {
    expect(normalizeName("  たろう  ")).toBe("たろう");
  });

  it("空白だけなら空にする", () => {
    expect(normalizeName("   ")).toBe("");
  });

  it("長すぎる名前を切り詰める", () => {
    expect(normalizeName("あ".repeat(MAX_NAME_LENGTH + 5))).toHaveLength(MAX_NAME_LENGTH);
  });
});
