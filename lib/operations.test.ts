import { describe, expect, it } from "vitest";
import { DEFAULT_BOARD_SIZE, type Operation, type OperationBody, pointKey, replay } from "./operations";

const alice = { userId: "alice-0001", name: "A", color: "#000" };
const bob = { userId: "bob-000001", name: "B", color: "#fff" };

function op(body: OperationBody, by = alice, at = 0): Operation {
  return { ...body, by, at };
}

describe("replay", () => {
  it("部屋を作ったときの盤面は、石がなく 9×9", () => {
    const { board } = replay([]);
    expect(board.size).toBe(DEFAULT_BOARD_SIZE);
    expect(board.size).toBe(9);
    expect(board.stones.size).toBe(0);
  });

  it("置いた石と取り除いた石を当てはめる", () => {
    const { board, results } = replay([
      op({ type: "place", x: 1, y: 2 }),
      op({ type: "place", x: 3, y: 4 }),
      op({ type: "remove", x: 1, y: 2 }),
    ]);
    expect([...board.stones]).toEqual([pointKey(3, 4)]);
    expect(results.map((r) => r.effective)).toEqual([true, true, true]);
  });

  it("同じ格子点に2人が置いたら、記録で後の操作は何もしない", () => {
    const { board, results } = replay([
      op({ type: "place", x: 0, y: 0 }, alice),
      op({ type: "place", x: 0, y: 0 }, bob),
    ]);
    expect(board.stones.size).toBe(1);
    expect(results.map((r) => r.effective)).toEqual([true, false]);
  });

  it("石がない格子点から取り除く操作は何もしない", () => {
    const { results } = replay([op({ type: "remove", x: 0, y: 0 })]);
    expect(results[0].effective).toBe(false);
  });

  it("盤面の外の格子点を指定した操作は何もしない", () => {
    const { board, results } = replay([
      op({ type: "place", x: 9, y: 0 }),
      op({ type: "place", x: -1, y: 0 }),
      op({ type: "place", x: 0.5, y: 0 }),
    ]);
    expect(board.stones.size).toBe(0);
    expect(results.every((r) => !r.effective)).toBe(true);
  });

  it("同じ記録からは同じ盤面になる", () => {
    const operations = [
      op({ type: "place", x: 2, y: 2 }),
      op({ type: "place", x: 2, y: 2 }, bob),
      op({ type: "remove", x: 2, y: 2 }, bob),
      op({ type: "place", x: 5, y: 1 }),
    ];
    const a = replay(operations);
    const b = replay(structuredClone(operations));
    expect([...a.board.stones]).toEqual([...b.board.stones]);
    expect(a.results.map((r) => r.effective)).toEqual(b.results.map((r) => r.effective));
  });
});
