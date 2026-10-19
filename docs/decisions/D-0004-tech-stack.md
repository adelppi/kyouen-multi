# D-0004 技術スタックと同期の方式

- 日付: 2026-10-18
- 決めた人: adelppi
- 関係する Issue と PR: #5
- 解決した未解決の項目: OQ-006
- 置き換える記録: なし

## 背景

`vision.md` で、マルチプレイの管理を重視すると決めた。参加者のカーソルの軌跡のリアルタイムな表示、参加者全体の操作に対する undo と redo、誰が置いたかの履歴、同時の操作の競合の解決が必要になる。デプロイ先は Vercel がよいと adelppi から示された。

## 決定

- Next.js（App Router）と TypeScript で作り、Vercel にデプロイする。GitHub とつなぎ、`main` へのマージで本番に、PR ごとにプレビューにデプロイする。
- 同期には Liveblocks を使う。参加者とカーソルは Presence で、操作の記録は Storage の LiveList で扱う。秘密鍵は Vercel の環境変数に入れる。
- 盤面は SVG と React で描く。カーソルは盤面の上に重ねた別の層に描き、座標は盤面の座標で送る。
- 共円の判定と置ける場所の計算は、各クライアントが盤面から計算する。判定には整数の行列式を使う（[共円のルールと用語](../specs/kyouen-rules.md)）。

操作の扱いは次のとおりにする。

- 置く、取り除く、undo、redo、リセット、サイズ変更を、順番つきの操作として記録に追記する。1つの操作に、誰の操作かと中身を持たせる。
- 盤面は、記録を先頭から順に当てはめた結果として計算する。
- 同時の操作は、記録の順番で決着させる。たとえば2人が同じ点に同時に置いたら、後の操作は何もしない操作として扱う。
- undo は、全体で最後に有効だった操作を取り消す操作として記録する。2人がほぼ同時に undo を押したら、2手戻る。
- カーソルは記録に入れず、Presence で一時的な情報として流す。

## ほかの選択肢

- Vercel Functions の WebSocket と Redis。Vercel の中で完結するが、2026-10-18 の時点で public beta だった。接続は関数の最大実行時間で切れ（Hobby は300秒）、インスタンス同士はメモリを共有しないので、再接続と Redis による配信と順番付けを自分で作る必要がある。
- Cloudflare Durable Objects（PartyKit など）。部屋ごとに1つのプロセスが順番を付けられるが、リアルタイムの部分が Vercel の外に出る。
- P2P で直接つなぐ案。全員の操作に1つの順番を付ける場所がないので、全体の undo と競合の解決が難しい。
- CRDT で盤面を同期する案。盤面が小さく、操作も1手ずつなので、順番つきの記録で足りると考えた。
- Canvas で描く案。盤面の要素の数が少ないので SVG で足りると考えた。性能の問題が出たら見直す。

## 根拠

- Liveblocks には参加者とカーソルを扱う Presence と、順番がそろう共有の LiveList があり、自前のサーバーを持たずに済む。同期の部分に手をかけず、カーソルの滑らかさや操作の感触に時間を使える。これは `vision.md` の判断の基準の1番目（複数人でプレイしたときの体験）に合う。
- Liveblocks の undo は一人ずつの操作が対象なので、全体の undo は上の記録の方式で作る。
- Claude が A〜C の案を示し、adelppi が推奨の案（Liveblocks）を選んだ。同時の undo の扱いも、Claude の案を adelppi が選んだ。
- 参考にした資料: [Do Vercel Serverless Functions support WebSocket connections?](https://vercel.com/support/articles/do-vercel-serverless-functions-support-websocket-connections)、[Liveblocks Storage](https://liveblocks.io/docs/storage)

## 影響

- OQ-006 を解決済みにした。
- 機能の仕様（#6）は、この操作の扱いを前提に書く。

D-0015 でデプロイの方法の部分を置き換えた
