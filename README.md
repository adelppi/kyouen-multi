# 共円マルチ

開発の進め方とドキュメントは [docs/README.md](docs/README.md) を参照。

## 開発

`.env.example` を `.env.local` に写し、値を入れる。

```bash
cp .env.example .env.local
pnpm install
pnpm dev    # http://localhost:3000 で開く
pnpm lint
pnpm test
pnpm build
```

## デプロイ

Vercel へのデプロイは、GitHub Actions の `.github/workflows/deploy.yml` が行う。`main` への push で本番に、同じリポジトリのブランチから出した PR でプレビューにデプロイする。Vercel の Git 連携による自動デプロイは、`vercel.json` で止めている。理由は [D-0015](docs/decisions/D-0015-deploy-from-actions.md) にある。

ワークフローは、GitHub の Settings → Secrets and variables → Actions にある次の Secrets を使う。

| 名前 | 値 |
|---|---|
| `VERCEL_TOKEN` | Vercel の Account Settings → Tokens で作ったトークン |
| `VERCEL_ORG_ID` | Vercel のチームの ID（`team_` で始まる） |
| `VERCEL_PROJECT_ID` | Vercel のプロジェクトの ID（`prj_` で始まる） |

2つの ID は、手元で `vercel link` を実行すると `.vercel/project.json` に書き出される。

アプリの環境変数（`.env.example` にあるもの）は、これまでどおり Vercel のプロジェクトに入れる。ワークフローは `vercel pull` でそれを読み込んでビルドする。
