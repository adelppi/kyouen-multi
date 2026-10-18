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

describe("undo と redo", () => {
  const place = (x: number, y: number, by = alice) => op({ type: "place", x, y }, by);
  const undo = (by = alice) => op({ type: "undo" }, by);
  const redo = (by = alice) => op({ type: "redo" }, by);
  const stonesOf = (operations: Operation[]) => [...replay(operations).board.stones].sort();

  it("ほかの参加者が置いた石も undo で取り消せる", () => {
    const { board, results } = replay([place(1, 1, alice), undo(bob)]);
    expect(board.stones.size).toBe(0);
    expect(results.map((r) => r.undone)).toEqual([true, false]);
    expect(results[1].target).toBe(0);
  });

  it("undo のあとに redo すると、元の盤面に戻る", () => {
    const operations = [place(1, 1), place(2, 2), op({ type: "remove", x: 1, y: 1 })];
    const before = stonesOf(operations);
    expect(stonesOf([...operations, undo(), undo(), redo(), redo()])).toEqual(before);
    const { results } = replay([...operations, undo(), undo(), redo(), redo()]);
    expect(results.every((r) => !r.undone)).toBe(true);
  });

  it("undo は記録の新しい操作から順に取り消す", () => {
    expect(stonesOf([place(1, 1), place(2, 2), undo()])).toEqual([pointKey(1, 1)]);
    expect(stonesOf([place(1, 1), place(2, 2), op({ type: "remove", x: 1, y: 1 }), undo()])).toEqual(
      [pointKey(1, 1), pointKey(2, 2)].sort(),
    );
  });

  it("undo のあとに誰かが石を置くと、redo できなくなる", () => {
    const { board, results, canRedo } = replay([place(1, 1), undo(), place(2, 2, bob), redo()]);
    expect([...board.stones]).toEqual([pointKey(2, 2)]);
    expect(canRedo).toBe(false);
    expect(results[3].effective).toBe(false);
    // 取り消した操作は、redo できなくなっても取り消されたまま
    expect(results[0].undone).toBe(true);
  });

  it("2人がほぼ同時に undo を押すと、2つの操作が取り消される", () => {
    expect(stonesOf([place(1, 1), place(2, 2), place(3, 3), undo(alice), undo(bob)])).toEqual([pointKey(1, 1)]);
  });

  it("盤面を変えなかった操作は取り消せる操作に積まない", () => {
    const { board, results } = replay([place(1, 1), place(1, 1, bob), undo()]);
    expect(board.stones.size).toBe(0);
    expect(results[2].target).toBe(0);
  });

  it("取り消せる操作がないときの undo と、やり直せる操作がないときの redo は何もしない", () => {
    const { results, canUndo, canRedo } = replay([undo(), redo()]);
    expect(results.map((r) => r.effective)).toEqual([false, false]);
    expect(canUndo).toBe(false);
    expect(canRedo).toBe(false);
  });

  it("取り消せるかとやり直せるかを返す", () => {
    expect(replay([place(1, 1)])).toMatchObject({ canUndo: true, canRedo: false });
    expect(replay([place(1, 1), undo()])).toMatchObject({ canUndo: false, canRedo: true });
  });
});
