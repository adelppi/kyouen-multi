"use client";

import { useMutation, useSelf, useStorage } from "@liveblocks/react/suspense";
import { useMemo } from "react";
import { colorForConnection } from "@/lib/colors";
import { getUserId } from "@/lib/local-identity";
import { type OperationBody, parsePointKey, pointKey, replay } from "@/lib/operations";

// 盤面のまわりの余白（格子の間隔を1とする）
const MARGIN = 0.7;
const STONE_RADIUS = 0.38;

export function Board() {
  const operations = useStorage((root) => root.operations);
  const { board } = useMemo(() => replay(operations), [operations]);
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

  const { size, stones } = board;
  const last = size - 1;
  const points = useMemo(
    () => Array.from({ length: size * size }, (_, i) => ({ x: i % size, y: Math.floor(i / size) })),
    [size],
  );

  return (
    <svg
      aria-label={`${size}×${size} の盤面`}
      className="aspect-square w-full max-w-[min(100%,80vh)] touch-manipulation select-none"
      role="img"
      viewBox={`${-MARGIN} ${-MARGIN} ${last + MARGIN * 2} ${last + MARGIN * 2}`}
    >
      <rect
        className="fill-amber-50 dark:fill-zinc-900"
        height={last + MARGIN * 2}
        rx={0.2}
        width={last + MARGIN * 2}
        x={-MARGIN}
        y={-MARGIN}
      />
      <g className="stroke-zinc-400 dark:stroke-zinc-600" strokeWidth={0.03}>
        {Array.from({ length: size }, (_, i) => (
          <g key={i}>
            <line x1={0} x2={last} y1={i} y2={i} />
            <line x1={i} x2={i} y1={0} y2={last} />
          </g>
        ))}
      </g>
      {[...stones].map((key) => {
        const { x, y } = parsePointKey(key);
        return <circle key={key} className="fill-zinc-900 dark:fill-zinc-100" cx={x} cy={y} r={STONE_RADIUS} />;
      })}
      {points.map(({ x, y }) => {
        const hasStone = stones.has(pointKey(x, y));
        return (
          <circle
            key={pointKey(x, y)}
            aria-label={`${x + 1}列 ${y + 1}行${hasStone ? "の石を取り除く" : "に石を置く"}`}
            className={
              hasStone
                ? "cursor-pointer fill-transparent hover:fill-red-500/25"
                : "cursor-pointer fill-transparent hover:fill-zinc-900/20 dark:hover:fill-zinc-100/20"
            }
            cx={x}
            cy={y}
            onClick={() => record({ type: hasStone ? "remove" : "place", x, y })}
            r={0.5}
            role="button"
          />
        );
      })}
    </svg>
  );
}
