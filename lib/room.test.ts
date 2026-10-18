import { describe, expect, it } from "vitest";
import {
  EMPTY_GRACE_MS,
  generateRoomId,
  isValidRoomId,
  shouldDeleteRoom,
} from "./room";

describe("generateRoomId", () => {
  it("部屋 ID の形に合う ID を作る", () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidRoomId(generateRoomId())).toBe(true);
    }
  });
});

describe("isValidRoomId", () => {
  it("形に合わない ID を受け付けない", () => {
    expect(isValidRoomId("short")).toBe(false);
    expect(isValidRoomId("ABCDEFGHIJ")).toBe(false);
    expect(isValidRoomId("abc/efghij")).toBe(false);
    expect(isValidRoomId(undefined)).toBe(false);
  });
});

describe("shouldDeleteRoom", () => {
  const now = Date.parse("2026-10-18T12:00:00Z");
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it("空になってから5分を過ぎ、誰もいなければ消す", () => {
    expect(shouldDeleteRoom(ago(EMPTY_GRACE_MS), 0, now)).toBe(true);
  });

  it("空になってから5分たっていなければ消さない", () => {
    expect(shouldDeleteRoom(ago(EMPTY_GRACE_MS - 1), 0, now)).toBe(false);
  });

  it("誰かいれば消さない", () => {
    expect(shouldDeleteRoom(ago(EMPTY_GRACE_MS * 2), 1, now)).toBe(false);
  });

  it("空になった時刻がなければ消さない", () => {
    expect(shouldDeleteRoom(undefined, 0, now)).toBe(false);
    expect(shouldDeleteRoom("not a date", 0, now)).toBe(false);
  });
});
