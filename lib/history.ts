// 操作の履歴の一覧に出す文言（history.md）

import type { Operation } from "@/lib/operations";

// 操作の種類と、置くと取り除くのときは格子点を、一覧の1行の文言にする
export function describeOperation(operation: Operation): string {
  switch (operation.type) {
    case "place":
      return `${operation.x + 1}列 ${operation.y + 1}行に置いた`;
    case "remove":
      return `${operation.x + 1}列 ${operation.y + 1}行から取り除いた`;
    case "reset":
      return "リセットした";
    case "resize":
      return `サイズを ${operation.size}×${operation.size} にした`;
    case "undo":
      return "元に戻した";
    case "redo":
      return "やり直した";
  }
}
