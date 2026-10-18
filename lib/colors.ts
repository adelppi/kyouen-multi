// 参加者の色。connection ID は部屋に入った順に増えるので、入った順に色の並びから選ぶ（D-0008）

export const PARTICIPANT_COLORS = [
  "#e5484d",
  "#0090ff",
  "#30a46c",
  "#f76b15",
  "#8e4ec6",
  "#12a594",
  "#d6409f",
  "#978365",
] as const;

export function colorForConnection(connectionId: number): string {
  const index = Math.abs(connectionId) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[index];
}
