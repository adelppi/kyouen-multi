import type { LiveList } from "@liveblocks/client";
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
    };
  }
}

export {};
