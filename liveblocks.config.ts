import type { LiveList, LiveObject } from "@liveblocks/client";
import type { Operation } from "@/lib/operations";

declare global {
  interface Liveblocks {
    Presence: {
      name: string;
      // 盤面の座標。盤面の外にあるときは null
      cursor: { x: number; y: number } | null;
    };
    Storage: {
      operations: LiveList<Operation>;
      // 表示の切り替え。部屋の全員で共通で、操作の記録には入れない（D-0016）
      display: LiveObject<{ showKyouen: boolean; showSafePoints: boolean }>;
    };
  }
}

export {};
