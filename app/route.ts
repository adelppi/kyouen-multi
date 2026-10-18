import { NextResponse, type NextRequest } from "next/server";
import { generateRoomId } from "@/lib/room";

// トップの URL を開くと、新しい部屋を作ってその URL に移る（room.md の 1）
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL(`/r/${generateRoomId()}`, request.url));
}
