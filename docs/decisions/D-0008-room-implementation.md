# D-0008 部屋と参加の作り方

- 日付: 2026-10-18
- 決めた人: Claude（#11 の実装で選んだ。合わなければ adelppi が置き換える）
- 関係する Issue と PR: #11
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

[部屋と参加](../specs/room.md)を実装するにあたり、次の3つの作り方を決める必要があった。

- 全員が抜けてから5分後に部屋を消す方法（D-0007）
- 認証なしで参加者を見分ける方法（D-0003）
- 参加者の色を部屋に入った順に割り当てる方法（D-0007）

Liveblocks には、空いた部屋を自動で消す機能が見当たらなかった。Vercel Functions はリクエストのあとで5分待つ処理に向かない。

## 決定

- 部屋を消す方法
  - Liveblocks の webhook の `userLeft` で、部屋に残った人数（`numActiveUsers`）が0になったら、部屋のメタデータ `emptySince` に時刻を書く。`userEntered` が来たら `emptySince` を消す。
  - 参加者が部屋に入るとき（Liveblocks の認証のエンドポイント）に、`emptySince` から5分を過ぎていて、部屋にいる人が0人なら、部屋を消してから入れる。
  - 毎日1回の Vercel Cron で、`emptySince` から5分を過ぎた部屋を消す。誰も開かない部屋が残り続けないようにするため。
- 参加者を見分ける方法
  - ブラウザごとにランダムな ID を作って `localStorage` に残し、Liveblocks の user ID に使う。
  - 名前は Liveblocks の Presence に入れる。
- 色を割り当てる方法
  - Liveblocks の connection ID は部屋に入った順に増えるので、connection ID から色の並びの色を選ぶ。
  - 再読み込みなどで入り直すと、新しい connection ID になり、色が変わることがある。

## ほかの選択肢

- 全員が抜けたらすぐに部屋を消す案。D-0007 で採らないと決まっている。
- 5分ごとに動く定期処理で消す案。Vercel の Hobby プランの Cron は1日1回までなので採らなかった。
- 色を Storage に保存して、入り直しても同じ色にする案。2人が同時に入ると同じ色を選ぶおそれがあり、防ぐには仕組みが増えるので採らなかった。困ったら見直す。

## 根拠

- 参加者から見ると、5分のうちに入れば元の盤面が残り、5分を過ぎて入れば新しい部屋になる。仕様の受け入れ条件はこれで満たせる。
- Liveblocks の `userLeft` の `numActiveUsers` は、抜けた人を除いた人数と Liveblocks の説明にある（[Webhook events](https://liveblocks.io/docs/api-reference/webhook-events)）。

## 影響

- `room.md` に、部屋を消す仕組みを書いた。
- Liveblocks のダッシュボードで webhook を設定し、署名の秘密鍵を Vercel の環境変数 `LIVEBLOCKS_WEBHOOK_SECRET` に入れる必要がある。Cron のために `CRON_SECRET` も入れる。
