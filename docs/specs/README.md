# 仕様

機能ごとの仕様を置く。ソースコードはここに書いた振る舞いに合わせる。

## 書き方

- 1つの機能に1つのファイルを作る。ファイル名は短い英語にする（例: `room-create.md`）。
- 新しく作るときは `_template.md` を写す。
- 仕様には、何をどう振る舞うかを書く。なぜそう決めたかは `decisions/` に書き、仕様からリンクする。
- 決まっていないことは仕様に推測で書かず、`open-questions.md` の項目へリンクする。

## 状態

各仕様の冒頭に、次のどれかを書く。

- 下書き: 書いている途中。未解決の項目が残っている。
- 合意: 内容が決まり、実装してよい。
- 実装済み: コードがこの仕様どおりに動く。

## 一覧

| 仕様 | 状態 | Issue |
|---|---|---|
| [kyouen-rules.md](kyouen-rules.md) 共円のルールと用語 | 合意 | #4 |
| [operation-log.md](operation-log.md) 操作の記録と同期 | 合意 | #12 |
| [room.md](room.md) 部屋と参加 | 実装済み | #11 |
| [board.md](board.md) 盤面と石の操作 | 合意 | #12 |
| [undo-redo.md](undo-redo.md) 全体の undo と redo | 実装済み | #13 |
| [history.md](history.md) 操作の履歴 | 実装済み | #14 |
| [cursors.md](cursors.md) カーソルと軌跡 | 実装済み | #15 |
| [reset.md](reset.md) 盤面のリセット | 実装済み | #16 |
| [board-size.md](board-size.md) 盤面のサイズの切り替え | 実装済み | #17 |
| [kyouen-display.md](kyouen-display.md) 完成した円の表示 | 合意 | #18 |
| [safe-points.md](safe-points.md) 石を置ける場所の表示 | 下書き | #19 |
