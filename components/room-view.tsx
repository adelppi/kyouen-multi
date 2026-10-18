"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { useState } from "react";
import { colorForConnection } from "@/lib/colors";

export function RoomView() {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <main className="flex flex-1 items-center justify-center p-6 text-sm text-zinc-500">
        盤面はここに表示します
      </main>
      <aside className="flex flex-col gap-4 border-t border-zinc-200 p-4 md:w-64 md:border-t-0 md:border-l dark:border-zinc-800">
        <CopyLinkButton />
        <ParticipantList />
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

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
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
