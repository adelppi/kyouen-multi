"use client";

import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { type PointerEvent, useMemo } from "react";
import { OtherCursors } from "@/components/cursors";
import type { Point } from "@/components/history";
import type { Game } from "@/components/use-game";
import { circleOf, clipLine, findKyouen } from "@/lib/kyouen";
import { parsePointKey, pointKey } from "@/lib/operations";

// 盤面のまわりの余白（格子の間隔を1とする）
const MARGIN = 0.7;
const VIEW_OF_DEFAULT_BOARD = 8 + MARGIN * 2;
const STONE_RADIUS = 0.38;

export function Board({
  game,
  highlight,
  showKyouen,
}: {
  game: Game;
  highlight: Point | null;
  showKyouen: boolean;
}) {
  const { board, record } = game;
  const { size, stones } = board;
  const last = size - 1;
  const updateMyPresence = useUpdateMyPresence();
  const kyouen = useMemo(() => (showKyouen ? findKyouen(stones) : []), [showKyouen, stones]);
  const points = useMemo(
    () => Array.from({ length: size * size }, (_, i) => ({ x: i % size, y: Math.floor(i / size) })),
    [size],
  );

  return (
    <svg
      aria-label={`${size}×${size} の盤面`}
      className="aspect-square w-full max-w-[min(100%,80vh)] touch-manipulation select-none"
      role="img"
      onPointerLeave={() => updateMyPresence({ cursor: null })}
      onPointerMove={(event) => updateMyPresence({ cursor: toBoardPoint(event) })}
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
      <g className="fill-none stroke-red-500/70" strokeWidth={0.06}>
        {kyouen.map(({ curve }) => {
          const key = `${curve.a},${curve.b},${curve.c},${curve.d}`;
          const circle = circleOf(curve);
          if (circle) return <circle key={key} cx={circle.cx} cy={circle.cy} r={circle.r} />;
          const ends = clipLine(curve, -MARGIN, last + MARGIN);
          if (!ends) return null;
          return <line key={key} x1={ends[0].x} x2={ends[1].x} y1={ends[0].y} y2={ends[1].y} />;
        })}
      </g>
      {[...stones].map((key) => {
        const { x, y } = parsePointKey(key);
        return <circle key={key} className="fill-zinc-900 dark:fill-zinc-100" cx={x} cy={y} r={STONE_RADIUS} />;
      })}
      {highlight && highlight.x >= 0 && highlight.y >= 0 && highlight.x < size && highlight.y < size && (
        <circle
          className="pointer-events-none fill-none stroke-sky-500"
          cx={highlight.x}
          cy={highlight.y}
          r={0.48}
          strokeWidth={0.08}
        />
      )}
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
      <OtherCursors scale={(last + MARGIN * 2) / VIEW_OF_DEFAULT_BOARD} />
    </svg>
  );
}

// カーソルの位置を、画面の座標から盤面の座標に直す。タッチ操作の位置は共有しない（cursors.md）
function toBoardPoint(event: PointerEvent<SVGSVGElement>): { x: number; y: number } | null {
  if (event.pointerType !== "mouse") return null;
  const matrix = event.currentTarget.getScreenCTM();
  if (!matrix) return null;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}
