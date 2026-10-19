# D-0015 Vercel へのデプロイを GitHub Actions から行う

- 日付: 2026-10-19
- 決めた人: adelppi（トークンを使って CI からデプロイすること）。ワークフローの形は Claude が選んだ
- 関係する Issue と PR: #43
- 解決した未解決の項目: なし
- 置き換える記録: D-0004（デプロイの方法の部分だけ）

## 背景

[D-0004](D-0004-tech-stack.md) で、Vercel を GitHub とつなぎ、`main` へのマージで本番に、PR ごとにプレビューにデプロイすると決めた。

adelppi 以外が `main` に push すると、Vercel のデプロイが失敗する。リポジトリは private で、Vercel のプロジェクトは adelppi のアカウントにある。Vercel の Hobby プランでは、チームに入っていない人のコミットは Git 連携でデプロイされないためと考えている。デプロイのログと Vercel の説明では、この制限を確かめていない。

## 決定

- Vercel の Git 連携による自動デプロイを止める。`vercel.json` に `"git": { "deploymentEnabled": false }` を書く。
- GitHub Actions のワークフロー `.github/workflows/deploy.yml` で、Vercel CLI を使ってデプロイする。
  - `main` への push で本番にデプロイする。
  - 同じリポジトリのブランチから出した PR で、プレビューにデプロイする。fork からの PR はデプロイしない。
  - 手順は `vercel pull`、`vercel build`、`vercel deploy --prebuilt` の順にする。
- ワークフローは、GitHub の Secrets にある `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` を使う。トークンは adelppi が作る。

## ほかの選択肢

- Vercel の Pro プランにして、共同作業者をチームに入れる: 費用がかかるので採らなかった。
- リポジトリを public にする: 公開範囲を変えることになるので採らなかった。public にすれば制限が当たらないかどうかは確かめていない。
- `main` だけ Git 連携を止め、プレビューは Git 連携のままにする: adelppi 以外のブランチのプレビューも同じ理由で失敗すると考え、採らなかった。

## 根拠

- CLI からのデプロイは、トークンの持ち主が実行したことになる。そのため、コミットしたのが誰でもデプロイできると考えている。実際に adelppi 以外のコミットでデプロイできるかは、マージしたあとで確かめる。
- `git.deploymentEnabled` を `false` にすると、すべてのブランチで自動デプロイが止まる（https://vercel.com/docs/project-configuration/git-configuration）。

気をつけることは次のとおり。

- Vercel のトークンは、アカウント全体に効く。リポジトリに書き込める人は、ワークフローを書き換えて Secrets を読み出せるので、トークンを使える人と同じになる。
- Vercel は、複数人での開発を Pro プランの機能にしている。この方法が Vercel の規約にどう当たるかは確かめていない。

## 影響

- `vercel.json` に `git.deploymentEnabled` を足した。
- `.github/workflows/deploy.yml` を足した。
- `README.md` に、デプロイの仕組みと Secrets の入れ方を書いた。
