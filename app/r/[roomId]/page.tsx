import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoomClient } from "@/components/room-client";
import { isValidRoomId } from "@/lib/room";

export default function RoomPage({ params }: PageProps<"/r/[roomId]">) {
  return (
    <Suspense>
      <RoomEntry params={params} />
    </Suspense>
  );
}

async function RoomEntry({ params }: { params: PageProps<"/r/[roomId]">["params"] }) {
  const { roomId } = await params;
  if (!isValidRoomId(roomId)) notFound();
  return <RoomClient roomId={roomId} />;
}
