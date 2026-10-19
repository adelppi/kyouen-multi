import { describe, expect, it } from "vitest";
import { moveItem, orderParticipants } from "./participant-order";

const ids = (participants: { connectionId: number }[]) => participants.map((p) => p.connectionId);
const people = (...connectionIds: number[]) => connectionIds.map((connectionId) => ({ connectionId }));

describe("orderParticipants", () => {
  it("並び順がなければ、部屋に入った順に並べる", () => {
    expect(ids(orderParticipants(people(3, 1, 2), []))).toEqual([1, 2, 3]);
  });

  it("共有している並び順のとおりに並べる", () => {
    expect(ids(orderParticipants(people(1, 2, 3), [3, 1, 2]))).toEqual([3, 1, 2]);
  });

  it("並び順に入っていない参加者は、末尾に部屋に入った順で付ける", () => {
    expect(ids(orderParticipants(people(1, 2, 5, 4), [2, 1]))).toEqual([2, 1, 4, 5]);
  });

  it("抜けた参加者の connection ID は無視する", () => {
    expect(ids(orderParticipants(people(1, 3), [3, 2, 1]))).toEqual([3, 1]);
  });
});

describe("moveItem", () => {
  it("後ろへ動かす", () => {
    expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });

  it("前へ動かす", () => {
    expect(moveItem([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
  });

  it("元の配列は変えない", () => {
    const items = [1, 2, 3];
    moveItem(items, 0, 2);
    expect(items).toEqual([1, 2, 3]);
  });
});
