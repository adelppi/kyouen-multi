"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useEffect, useRef, useState } from "react";
import { colorForConnection } from "@/lib/colors";
import { type CursorPoint, pruneTrail, stepToward, type TrailPoint, trailOpacity } from "@/lib/cursor";

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

type Frame = { position: CursorPoint; trail: TrailPoint[]; now: number } | null;

function Cursor({ color, name, scale, target }: { color: string; name: string; scale: number; target: CursorPoint | null }) {
  const targetRef = useRef(target);
  const [frame, setFrame] = useState<Frame>(null);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // 受け取った位置へ、表示している位置をフレームごとに近づける
  useEffect(() => {
    let position: CursorPoint | null = null;
    let trail: TrailPoint[] = [];
    let request = 0;

    function tick(now: number) {
      const to = targetRef.current;
      if (!to) {
        // 盤面の外に出たカーソルは隠す
        if (position) setFrame(null);
        position = null;
        trail = [];
      } else {
        const next: CursorPoint = position ? stepToward(position, to) : to;
        const moved = next !== position;
        position = next;
        if (moved) trail.push({ ...next, t: now });
        const pruned = pruneTrail(trail, now);
        if (moved || pruned.length !== trail.length || pruned.length > 0) setFrame({ position, trail: pruned, now });
        trail = pruned;
      }
      request = requestAnimationFrame(tick);
    }

    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, []);

  if (!frame) return null;
  const { position, trail, now } = frame;

  return (
    <g>
      {trail.slice(1).map((point, i) => (
        <line
          key={point.t}
          stroke={color}
          strokeLinecap="round"
          strokeOpacity={trailOpacity(point, now) * 0.6}
          strokeWidth={0.08 * scale}
          x1={trail[i].x}
          x2={point.x}
          y1={trail[i].y}
          y2={point.y}
        />
      ))}
      <g transform={`translate(${position.x} ${position.y}) scale(${scale * CURSOR_SIZE})`}>
        <path d="M0 0 L0 0.6 L0.16 0.45 L0.28 0.7 L0.37 0.66 L0.25 0.41 L0.45 0.41 Z" fill={color} stroke="white" strokeWidth={0.04} />
        <text fill={color} fontSize={0.32} fontWeight={500} paintOrder="stroke" stroke="white" strokeWidth={0.06} x={0.42} y={0.85}>
          {name}
        </text>
      </g>
    </g>
  );
}
