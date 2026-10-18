"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";
import { Board } from "@/components/board";
import { History, type Point } from "@/components/history";
import { type Game, useGame } from "@/components/use-game";
import { colorForConnection } from "@/lib/colors";
import { MAX_BOARD_SIZE, MIN_BOARD_SIZE } from "@/lib/operations";

export function RoomView() {
  const game = useGame();
  const [highlight, setHighlight] = useState<Point | null>(null);
  // 表示の切り替えは参加者ごと（D-0007）
  const [showKyouen, setShowKyouen] = useState(false);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <main className="flex flex-1 items-center justify-center p-4">
        <Board game={game} highlight={highlight} showKyouen={showKyouen} />
      </main>
      <aside className="flex flex-col gap-4 border-t border-zinc-200 p-4 md:w-64 md:border-t-0 md:border-l dark:border-zinc-800">
        <CopyLinkButton />
        <UndoRedo game={game} />
        <button className={buttonClass} onClick={() => game.record({ type: "reset" })} type="button">
          リセット
        </button>
        <BoardSizeSelect game={game} />
        <Toggle checked={showKyouen} label="完成した円を表示" onChange={setShowKyouen} />
        <ParticipantList />
        <History game={game} onHighlight={setHighlight} />
      </aside>
    </div>
  );
}

function ParticipantList() {
  const self = useSelf((me) => ({ connectionId: me.connectionId, name: me.presence.name }));
  const others = useOthers((users) =>
    users.map((user) => ({ connectionId: user.connectionId, name: user.presence.name })),
  );
  const participants = [{ ...self, isSelf: true }, ...others.map((o) => ({ ...o, isSelf: false }))].sort(
    (a, b) => a.connectionId - b.connectionId,
  );

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium text-zinc-500">参加者 {participants.length}人</h2>
      <ul className="flex flex-col gap-1.5">
        {participants.map((p) => (
          <li key={p.connectionId} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorForConnection(p.connectionId) }}
            />
            <span className="truncate">{p.name}</span>
            {p.isSelf && <span className="text-xs text-zinc-400">（自分）</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-700 dark:hover:bg-zinc-900";

function UndoRedo({ game }: { game: Game }) {
  const { canUndo, canRedo, record } = game;

  // Ctrl+Z で undo、Ctrl+Shift+Z で redo。Mac では Ctrl の代わりに Cmd
  useEffect(() => {
    const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    function onKeyDown(event: KeyboardEvent) {
      if ((isMac ? !event.metaKey : !event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "z") return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, [contenteditable]")) return;
      event.preventDefault();
      record({ type: event.shiftKey ? "redo" : "undo" });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [record]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <button className={buttonClass} disabled={!canUndo} onClick={() => record({ type: "undo" })} type="button">
        元に戻す
      </button>
      <button className={buttonClass} disabled={!canRedo} onClick={() => record({ type: "redo" })} type="button">
        やり直す
      </button>
    </div>
  );
}

const BOARD_SIZES = Array.from({ length: MAX_BOARD_SIZE - MIN_BOARD_SIZE + 1 }, (_, i) => MIN_BOARD_SIZE + i);

function BoardSizeSelect({ game }: { game: Game }) {
  const { board, record } = game;

  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      盤面のサイズ
      <select
        className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
        onChange={(event) => record({ type: "resize", size: Number(event.target.value) })}
        value={board.size}
      >
        {BOARD_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}×{size}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input checked={checked} className="size-4 accent-zinc-900 dark:accent-zinc-100" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className={buttonClass}
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      type="button"
    >
      {copied ? "コピーしました" : "部屋の URL をコピー"}
    </button>
  );
}
