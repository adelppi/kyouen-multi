import type { LiveList } from "@liveblocks/client";
import type { Operation } from "@/lib/operations";

declare global {
  interface Liveblocks {
    Presence: {
      name: string;
    };
    Storage: {
      operations: LiveList<Operation>;
    };
  }
}

export {};
