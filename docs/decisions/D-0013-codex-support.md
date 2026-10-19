# D-0013 Codex でも開発できるようにする

- 日付: 2026-10-19
- 決めた人: adelppi（Codex でも使えるようにする依頼）。ファイルの置き方は Claude が選んだ
- 関係する Issue と PR: #39
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

開発の決まりは `CLAUDE.md` に、yomiyasu スキルは `.claude/skills/yomiyasu/` にあり、Claude Code だけが読む形だった。adelppi から、Codex も使えるようにするよう求められた。

Codex は、リポジトリの `AGENTS.md` を決まりとして読み、スキルを `.agents/skills/` から探す。スキルのフォルダがシンボリックリンクでも、リンク先をたどって読む（https://learn.chatgpt.com/docs/build-skills.md）。

## 決定

- 開発の決まりの本文を `AGENTS.md` に移す。`CLAUDE.md` は `@AGENTS.md` で `AGENTS.md` を読み込み、Claude Code だけに当てはまることがあればそこに書く。
- `AGENTS.md` の `<!-- BEGIN:nextjs-agent-rules -->` から `<!-- END:nextjs-agent-rules -->` までは `next dev` が書き直すので、決まりはその外に書く。
- yomiyasu スキルの本体は `.claude/skills/yomiyasu/` に置いたままにする。`.agents/skills/yomiyasu` は、本体を指すシンボリックリンクにする。

## ほかの選択肢

- `CLAUDE.md` と `AGENTS.md` に同じ決まりを書く: 片方だけを直して食い違うおそれがあるので採らなかった。
- スキルの本体を `.agents/skills/` に移し、`.claude/skills/` をリンクにする: Codex がリンクをたどることは公式の説明で確かめられたが、Claude Code については確かめていないので採らなかった。
- スキルを2か所に写す: 更新のたびに2か所を写し直すことになるので採らなかった。

## 根拠

決まりを1か所にまとめれば、Claude Code と Codex が同じ決まりで作業する。`next dev` が書き直すのは印で囲んだ部分だけで、外に書いた内容は残る（`node_modules/next/dist/server/lib/generate-agent-files.js` で確かめた）。

## 影響

- `AGENTS.md` に開発の決まりを書いた。
- `CLAUDE.md` を、`AGENTS.md` を読み込む形にした。
- `.agents/skills/yomiyasu` を足した。
- `docs/README.md` の文体の節で、参照先を `AGENTS.md` にした。
