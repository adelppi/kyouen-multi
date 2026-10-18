"use client";

import { useMutation, useSelf, useStorage } from "@liveblocks/react/suspense";
import { useMemo } from "react";
import { colorForConnection } from "@/lib/colors";
import { getUserId } from "@/lib/local-identity";
import { type OperationBody, replay } from "@/lib/operations";

// 操作の記録から計算した盤面と、操作を記録に追記する関数を返す
export function useGame() {
  const operations = useStorage((root) => root.operations);
  const game = useMemo(() => replay(operations), [operations]);
  const self = useSelf((me) => ({ connectionId: me.connectionId, name: me.presence.name }));

  const record = useMutation(
    ({ storage }, body: OperationBody) => {
      storage.get("operations").push({
        ...body,
        by: { userId: getUserId(), name: self.name, color: colorForConnection(self.connectionId) },
        at: Date.now(),
      });
    },
    [self.name, self.connectionId],
  );

  return { ...game, record };
}

export type Game = ReturnType<typeof useGame>;
