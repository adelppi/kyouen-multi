// 盤面の描き方の寸法と、保存する画像の SVG（board-image.md）

import { circleOf, clipLine, type Kyouen } from "./kyouen";
import { type Board, parsePointKey } from "./operations";

// 寸法は格子の間隔を1とする。画面の盤面と画像で同じ値を使う
// 盤面のまわりの余白
export const MARGIN = 0.7;
export const STONE_RADIUS = 0.38;
export const BOARD_CORNER_RADIUS = 0.2;
export const GRID_STROKE_WIDTH = 0.03;
export const KYOUEN_STROKE_WIDTH = 0.06;

// 保存する画像の幅と高さ（ピクセル）
export const IMAGE_SIZE = 1200;

// 画像の色は明るいテーマに固定する。画面の amber-50、zinc-400、red-600、zinc-900 に合わせる
const COLORS = {
  background: "#fffbeb",
  grid: "#9f9fa9",
  kyouen: "#e7000b",
  stone: "#18181b",
};

// 背景、格子、完成した円と直線、石を描いた SVG。円と直線を描かないときは kyouen を空にする
export function boardImageSvg(board: Board, kyouen: readonly Kyouen[]): string {
  const last = board.size - 1;
  const view = last + MARGIN * 2;
  const parts: string[] = [];

  parts.push(
    `<rect x="${-MARGIN}" y="${-MARGIN}" width="${view}" height="${view}" rx="${BOARD_CORNER_RADIUS}" fill="${COLORS.background}"/>`,
  );

  parts.push(`<g stroke="${COLORS.grid}" stroke-width="${GRID_STROKE_WIDTH}">`);
  for (let i = 0; i < board.size; i++) {
    parts.push(`<line x1="0" x2="${last}" y1="${i}" y2="${i}"/>`, `<line x1="${i}" x2="${i}" y1="0" y2="${last}"/>`);
  }
  parts.push("</g>");

  parts.push(`<g fill="none" stroke="${COLORS.kyouen}" stroke-width="${KYOUEN_STROKE_WIDTH}">`);
  for (const { curve } of kyouen) {
    const circle = circleOf(curve);
    if (circle) {
      parts.push(`<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}"/>`);
      continue;
    }
    const ends = clipLine(curve, -MARGIN, last + MARGIN);
    if (ends) parts.push(`<line x1="${ends[0].x}" x2="${ends[1].x}" y1="${ends[0].y}" y2="${ends[1].y}"/>`);
  }
  parts.push("</g>");

  parts.push(`<g fill="${COLORS.stone}">`);
  for (const key of board.stones) {
    const { x, y } = parsePointKey(key);
    parts.push(`<circle cx="${x}" cy="${y}" r="${STONE_RADIUS}"/>`);
  }
  parts.push("</g>");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" viewBox="${-MARGIN} ${-MARGIN} ${view} ${view}">${parts.join("")}</svg>`;
}
