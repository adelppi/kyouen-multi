// ブラウザごとの参加者 ID と、前に入れた名前（room.md の 3、D-0008）

const USER_ID_KEY = "kyouen:userId";
const NAME_KEY = "kyouen:name";

export const MAX_NAME_LENGTH = 20;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 保存できなくても参加はできる
  }
}

let fallbackUserId: string | undefined;

export function getUserId(): string {
  const saved = read(USER_ID_KEY);
  if (saved) return saved;
  const id = crypto.randomUUID();
  write(USER_ID_KEY, id);
  fallbackUserId ??= id;
  return read(USER_ID_KEY) ?? fallbackUserId;
}

export function getSavedName(): string {
  return read(NAME_KEY) ?? "";
}

export function saveName(name: string) {
  write(NAME_KEY, name);
}

export function normalizeName(input: string): string {
  return input.trim().slice(0, MAX_NAME_LENGTH);
}
