// 参加者の一覧の並び順。部屋で共有する並び順（connection ID の並び）に入っている参加者を先に並べ、
// 入っていない参加者は部屋に入った順にあとへ付ける（D-0017）

export function orderParticipants<T extends { connectionId: number }>(participants: readonly T[], order: readonly number[]): T[] {
  const position = new Map(order.map((id, index) => [id, index]));
  const rank = (p: T) => position.get(p.connectionId) ?? order.length;
  return [...participants].sort((a, b) => rank(a) - rank(b) || a.connectionId - b.connectionId);
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
