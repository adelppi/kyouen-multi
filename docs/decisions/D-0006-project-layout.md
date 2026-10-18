# D-0006 リポジトリの構成と開発の道具

- 日付: 2026-10-18
- 決めた人: adelppi（Vercel のルートディレクトリ）。ほかの道具は Claude が選んだ
- 関係する Issue と PR: #10
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

Next.js の雛形を作るにあたり、アプリを置く場所と、パッケージの管理、スタイル、テストの道具を決める必要があった。

## 決定

- Next.js のアプリをリポジトリの最上位に置く。Vercel のルートディレクトリは既定の `./` のままにする。
- パッケージの管理には pnpm を使う。
- スタイルには Tailwind CSS を使う。
- lint には ESLint（`eslint-config-next`）を、テストには Vitest を使う。
- 雛形は `create-next-app` で作った。Next.js は 16.4.2。

## ほかの選択肢

- `apps/web` のようなサブディレクトリにアプリを置く案。アプリは1つだけなので採らなかった。アプリが複数になったら見直す。
- npm を使う案。pnpm のほうがインストールが速く、手元で使えたので pnpm にした。
- CSS Modules だけで書く案。`create-next-app` の既定に Tailwind CSS があり、画面を作る速さを優先した。

## 根拠

- Vercel のルートディレクトリは、Claude が `./` を勧め、adelppi が「ok」と答えて決まった。
- ほかの道具は、`create-next-app` の既定に沿って Claude が選んだ。合わなければ新しい記録で置き換える。

## 影響

- リポジトリの最上位に `package.json`、`app/`、`next.config.ts` などを置いた。
- `CLAUDE.md` に、コードを書く前に `AGENTS.md` を読むことを書いた。
