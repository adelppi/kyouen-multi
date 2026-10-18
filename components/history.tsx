"use client";

import type { Game } from "@/components/use-game";
import { describeOperation } from "@/lib/history";

export type Point = { x: number; y: number };

export function History({ game, onHighlight }: { game: Game; onHighlight: (point: Point | null) => void }) {
  const rows = game.results.map((result, index) => ({ ...result, index })).reverse();

  return (
    <section className="flex min-h-0 flex-col gap-2">
      <h2 className="text-xs font-medium text-zinc-500">履歴</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">まだ操作がありません</p>
      ) : (
        <ol className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
          {rows.map(({ operation, effective, undone, index }) => {
            const point = "x" in operation ? { x: operation.x, y: operation.y } : null;
            return (
              <li
                key={index}
                className={`flex items-center gap-2 rounded px-1 py-0.5 text-sm ${point ? "hover:bg-zinc-100 dark:hover:bg-zinc-900" : ""} ${effective && !undone ? "" : "text-zinc-400"}`}
                onPointerEnter={point ? () => onHighlight(point) : undefined}
                onPointerLeave={point ? () => onHighlight(null) : undefined}
              >
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: operation.by.color }} />
                <span className="max-w-24 shrink-0 truncate">{operation.by.name}</span>
                <span className={`truncate ${undone ? "line-through" : ""}`}>{describeOperation(operation)}</span>
                {!effective && <span className="shrink-0 text-xs">（何もしない）</span>}
                {undone && <span className="shrink-0 text-xs">（取り消し）</span>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
