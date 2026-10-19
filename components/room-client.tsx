"use client";

import { LiveList, LiveObject } from "@liveblocks/client";
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { useState } from "react";
import { JoinForm } from "@/components/join-form";
import { RoomView } from "@/components/room-view";
import { CURSOR_THROTTLE_MS } from "@/lib/cursor";
import { getUserId } from "@/lib/local-identity";

async function authenticate(room?: string) {
  const response = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, userId: getUserId() }),
  });
  return response.json();
}

export function RoomClient({ roomId }: { roomId: string }) {
  const [name, setName] = useState<string | null>(null);

  if (name === null) return <JoinForm onJoin={setName} />;

  return (
    <LiveblocksProvider authEndpoint={authenticate} throttle={CURSOR_THROTTLE_MS}>
      <RoomProvider
        id={roomId}
        initialPresence={{ name, cursor: null }}
        initialStorage={() => ({
          operations: new LiveList([]),
          display: new LiveObject({ showKyouen: false, showSafePoints: false }),
          participantOrder: [],
        })}
      >
        <ClientSideSuspense fallback={<Centered>接続しています…</Centered>}>
          <RoomView />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center text-sm text-zinc-500">
      {children}
    </main>
  );
}
