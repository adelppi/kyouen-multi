import "server-only";
import { Liveblocks } from "@liveblocks/node";

let client: Liveblocks | undefined;

export function liveblocks(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY が設定されていません");
  client ??= new Liveblocks({ secret });
  return client;
}
