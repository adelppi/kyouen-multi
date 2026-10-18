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
