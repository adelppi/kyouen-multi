// 操作の記録と、記録から盤面を計算する処理（operation-log.md）

export const DEFAULT_BOARD_SIZE = 9;

// 操作したときの参加者。名前と色は操作したときの値を残す
export type Actor = {
  userId: string;
  name: string;
  color: string;
};

export type OperationBody =
  | { type: "place"; x: number; y: number }
  | { type: "remove"; x: number; y: number };

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

// 記録を先頭から順に当てはめる。同じ記録からは、どのクライアントでも同じ盤面になる
export function replay(operations: readonly Operation[]): {
  board: Board;
  results: OperationResult[];
} {
  const size = DEFAULT_BOARD_SIZE;
  const stones = new Set<string>();
  const results: OperationResult[] = [];

  for (const operation of operations) {
    let effective = false;
    if (isOnBoard(size, operation.x, operation.y)) {
      const key = pointKey(operation.x, operation.y);
      if (operation.type === "place" && !stones.has(key)) {
        stones.add(key);
        effective = true;
      } else if (operation.type === "remove" && stones.has(key)) {
        stones.delete(key);
        effective = true;
      }
    }
    results.push({ operation, effective });
  }

  return { board: { size, stones }, results };
}
