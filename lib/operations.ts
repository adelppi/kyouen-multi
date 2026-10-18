// 操作の記録と、記録から盤面を計算する処理（operation-log.md、undo-redo.md）

export const DEFAULT_BOARD_SIZE = 9;

// 操作したときの参加者。名前と色は操作したときの値を残す
export type Actor = {
  userId: string;
  name: string;
  color: string;
};

export type OperationBody =
  | { type: "place"; x: number; y: number }
  | { type: "remove"; x: number; y: number }
  | { type: "undo" }
  | { type: "redo" };

export type Operation = OperationBody & {
  by: Actor;
  at: number;
};

export type Board = {
  size: number;
  stones: ReadonlySet<string>;
};

export type OperationResult = {
  operation: Operation;
  // 盤面を変えたかどうか。変えなかった操作は、何もしない操作として扱う
  effective: boolean;
  // 記録の最後の時点で、undo で取り消されているかどうか
  undone: boolean;
  // undo と redo のとき、取り消した、またはやり直した操作の記録の位置
  target?: number;
};

export type ReplayResult = {
  board: Board;
  results: OperationResult[];
  canUndo: boolean;
  canRedo: boolean;
};

export function pointKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parsePointKey(key: string): { x: number; y: number } {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

function isOnBoard(size: number, x: number, y: number): boolean {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size;
}

// 盤面を変える操作を当てはめる。盤面が変わらないときは null を返す
function apply(board: Board, operation: Operation): Board | null {
  switch (operation.type) {
    case "place":
    case "remove": {
      if (!isOnBoard(board.size, operation.x, operation.y)) return null;
      const key = pointKey(operation.x, operation.y);
      if (operation.type === "place" ? board.stones.has(key) : !board.stones.has(key)) return null;
      const stones = new Set(board.stones);
      if (operation.type === "place") stones.add(key);
      else stones.delete(key);
      return { size: board.size, stones };
    }
    default:
      return null;
  }
}

type Step = { index: number; before: Board; after: Board };

// 記録を先頭から順に当てはめる。同じ記録からは、どのクライアントでも同じ盤面になる
export function replay(operations: readonly Operation[]): ReplayResult {
  let board: Board = { size: DEFAULT_BOARD_SIZE, stones: new Set() };
  // 取り消せる操作の列と、やり直せる操作の列（undo-redo.md）
  const undoStack: Step[] = [];
  let redoStack: Step[] = [];
  const results: OperationResult[] = [];

  operations.forEach((operation, index) => {
    const result: OperationResult = { operation, effective: false, undone: false };
    if (operation.type === "undo" || operation.type === "redo") {
      const from = operation.type === "undo" ? undoStack : redoStack;
      const to = operation.type === "undo" ? redoStack : undoStack;
      const step = from.pop();
      if (step) {
        board = operation.type === "undo" ? step.before : step.after;
        to.push(step);
        results[step.index].undone = operation.type === "undo";
        result.effective = true;
        result.target = step.index;
      }
    } else {
      const after = apply(board, operation);
      if (after) {
        undoStack.push({ index, before: board, after });
        redoStack = [];
        board = after;
        result.effective = true;
      }
    }
    results.push(result);
  });

  return { board, results, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 };
}
