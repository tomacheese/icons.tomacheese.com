# GitHub Copilot 指示

このリポジトリで Copilot がコードレビューを行う際の指針。プロジェクトの概要、コマンド、規約は、ルートの `AGENTS.md` を参照すること。レビューコメントは日本語で書く。

## レビューで重視する点

- `fetch-tomachi-emojis` のネットワーク呼び出し(axios)とファイル書き込みのエラー処理。
- `generate-readme` の CLI オプション(`--target-emojis`, `--target-stickers`, `--output`, `--target-guilds`, `--emojis`, `--stickers`)はすべて必須である。`.github/workflows/` の呼び出しと整合しているか。
- `README.md` は生成物である。直接編集は指摘し、形式の変更は `.github/scripts/generate-readme/template.md` 側で行うよう促す。
- 認証情報(`DISCORD_TOKEN` など)のハードコードや、秘密値のログ出力。
- スタイルは `eslint.config.mjs` と `.prettierrc.yml` に従う。個人の好みではなく、設定からの逸脱を指摘する。

## 指摘しないこと

- 自動テストが無いこと。テストの追加を当然のように求めない。
- ルートに `package.json` が無いこと。各スクリプトが独立した pnpm プロジェクトである設計による。
- `emojis.json`、`README.md`、画像など、生成物の大きなファイルをコミットしていること。意図的である。
