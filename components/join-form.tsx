"use client";

import { useState, useSyncExternalStore } from "react";
import { getSavedName, MAX_NAME_LENGTH, normalizeName, saveName } from "@/lib/local-identity";

export function JoinForm({ onJoin }: { onJoin: (name: string) => void }) {
  // 前に入れた名前を初めから入れておく。サーバーでは空にして、ブラウザで読み直す
  const savedName = useSyncExternalStore(subscribeNothing, getSavedName, () => "");
  const [edited, setEdited] = useState<string | null>(null);
  const input = edited ?? savedName;
  const name = normalizeName(input);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        className="flex w-full max-w-xs flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name) return;
          saveName(name);
          onJoin(name);
        }}
      >
        <h1 className="text-xl font-semibold">共円マルチ</h1>
        <label className="flex flex-col gap-1.5 text-sm">
          名前
          <input
            autoFocus
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
            maxLength={MAX_NAME_LENGTH}
            value={input}
            onChange={(event) => setEdited(event.target.value)}
          />
        </label>
        <button
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={!name}
          type="submit"
        >
          部屋に入る
        </button>
      </form>
    </main>
  );
}

function subscribeNothing() {
  return () => {};
}
