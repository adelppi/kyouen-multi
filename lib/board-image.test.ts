import { describe, expect, it } from "vitest";
import { boardImageSvg, IMAGE_SIZE } from "./board-image";
import type { Kyouen } from "./kyouen";
import { pointKey } from "./operations";

const board = (size: number, ...points: [number, number][]) => ({
  size,
  stones: new Set(points.map(([x, y]) => pointKey(x, y))),
});

const count = (svg: string, pattern: RegExp) => svg.match(pattern)?.length ?? 0;

describe("boardImageSvg", () => {
  it("決めた大きさの画像にし、余白を含めて盤面全体を写す", () => {
    const svg = boardImageSvg(board(9), []);
    expect(svg).toContain(`width="${IMAGE_SIZE}" height="${IMAGE_SIZE}"`);
    expect(svg).toContain('viewBox="-0.7 -0.7 9.4 9.4"');
  });

  it("背景と、盤面のサイズの数だけ縦横の格子を描く", () => {
    const svg = boardImageSvg(board(5), []);
    expect(count(svg, /<rect /g)).toBe(1);
    expect(count(svg, /<line /g)).toBe(10);
  });

  it("石を1つずつ描く", () => {
    const svg = boardImageSvg(board(9, [1, 2], [3, 4]), []);
    expect(svg).toContain('<circle cx="1" cy="2" r="0.38"/>');
    expect(svg).toContain('<circle cx="3" cy="4" r="0.38"/>');
  });

  it("渡した共円の円と直線を描き、空なら描かない", () => {
    // 中心 (1, 1)、半径 √2 の円と、直線 y = 6
    const kyouen: Kyouen[] = [
      { curve: { a: 1, b: -2, c: -2, d: 0 }, points: [] },
      { curve: { a: 0, b: 0, c: 1, d: -6 }, points: [] },
    ];
    const b = board(9, [0, 0], [2, 2]);
    const withCurves = boardImageSvg(b, kyouen);
    expect(withCurves).toContain(`<circle cx="1" cy="1" r="${Math.SQRT2}"/>`);
    expect(withCurves).toContain('<line x1="-0.7" x2="8.7" y1="6" y2="6"/>');
    const without = boardImageSvg(b, []);
    expect(count(without, /<circle /g)).toBe(2);
    expect(count(without, /<line /g)).toBe(18);
  });

  it("画面のテーマにかかわらず明るいテーマの色で描く", () => {
    const svg = boardImageSvg(board(9, [0, 0]), []);
    expect(svg).toContain('fill="#fffbeb"');
    expect(svg).toContain('fill="#18181b"');
  });
});
