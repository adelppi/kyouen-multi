"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useEffect, useRef, useState } from "react";
import { colorForConnection } from "@/lib/colors";
import { type CursorPoint, stepToward } from "@/lib/cursor";

// ほかの参加者のカーソルを、盤面の SVG の中に描く。scale は、盤面のサイズによらず同じ大きさに見せるための倍率
export function OtherCursors({ scale }: { scale: number }) {
  const others = useOthers((users) =>
    users.map((user) => ({ connectionId: user.connectionId, name: user.presence.name, cursor: user.presence.cursor })),
  );

  return (
    <g className="pointer-events-none">
      {others.map((other) => (
        <Cursor
          key={other.connectionId}
          color={colorForConnection(other.connectionId)}
          name={other.name}
          scale={scale}
          target={other.cursor}
        />
      ))}
    </g>
  );
}

// 盤面の座標で見た、カーソルの矢印と名前の大きさの倍率
const CURSOR_SIZE = 0.6;

function Cursor({ color, name, scale, target }: { color: string; name: string; scale: number; target: CursorPoint | null }) {
  const targetRef = useRef(target);
  const [position, setPosition] = useState<CursorPoint | null>(null);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // 受け取った位置へ、表示している位置をフレームごとに近づける
  useEffect(() => {
    let shown: CursorPoint | null = null;
    let request = 0;

    function tick() {
      const to = targetRef.current;
      // 盤面の外に出たカーソルは隠す
      const next: CursorPoint | null = to && shown ? stepToward(shown, to) : to;
      if (next !== shown) setPosition(next);
      shown = next;
      request = requestAnimationFrame(tick);
    }

    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, []);

  if (!position) return null;

  return (
    <g transform={`translate(${position.x} ${position.y}) scale(${scale * CURSOR_SIZE})`}>
      <path d="M0 0 L0 0.6 L0.16 0.45 L0.28 0.7 L0.37 0.66 L0.25 0.41 L0.45 0.41 Z" fill={color} stroke="white" strokeWidth={0.04} />
      <text fill={color} fontSize={0.32} fontWeight={500} paintOrder="stroke" stroke="white" strokeWidth={0.06} x={0.42} y={0.85}>
        {name}
      </text>
    </g>
  );
}
