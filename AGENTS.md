# AGENTS.md

## 言語ルール

- 成果物の言語は日本語とする。対象は、コミットの説明、PR / Issue のタイトルと本文、レビューコメント、コードコメント・JSDoc、ドキュメントである。
- 例外は、画面に出す文字列、引用、技術的識別子、生成ファイル、外部由来のテキスト、`package.json` である。
- エラーメッセージは英語とする。
- 日本語と英数字の間には半角スペースを入れる。
- コミットメッセージは Conventional Commits に従い、type と scope は英語、説明は日本語で書く。
- 散文の段落の途中で手動改行しない。

## プロジェクト概要

- Tomachi の Discord 絵文字・ステッカー・アイコンとそのメタデータを管理し、GitHub Pages(`CNAME`)で公開する。
- `.github/scripts/` 配下の独立した 2 つの TypeScript プロジェクトが処理を担う。`fetch-tomachi-emojis` が Discord から素材を取得し、`generate-readme` が `README.md` のカタログを生成する。どちらも CI で実行され、手動でコードを変更する機会は少ない。

## ディレクトリ構成

- `icons/`, `stickers/`: 取得済みの画像。
- `emojis.json`, `stickers.json`: `fetch-tomachi-emojis` が書き出すメタデータ。
- `targetGuilds.json`: 取得対象の Discord ギルド ID(入力)。
- `README.md`: 自動生成されるカタログ。直接編集せず、`generate-readme` で再生成する。形式を変える場合は `.github/scripts/generate-readme/template.md` と `src/main.ts` を編集する。
- `terms.md`: アイコン利用ルール(手書き)。
- `.github/scripts/<fetch-tomachi-emojis|generate-readme>/`: 独立した pnpm プロジェクト。ルートに `package.json` は無い。

## 開発コマンド

各スクリプトのディレクトリで実行する。pnpm(`only-allow pnpm` で強制)と tsx を使う。

```bash
cd .github/scripts/<fetch-tomachi-emojis|generate-readme>
pnpm install
pnpm lint   # prettier --check, eslint, tsc
pnpm fix    # prettier --write, eslint --fix
```

`fetch-tomachi-emojis`(環境変数 `DISCORD_TOKEN` が必要。未設定の場合は警告を出して何もせず終了する):

```bash
pnpm start --output-emojis ../../../icons/ --output-stickers ../../../stickers/ \
  --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

`generate-readme`(すべてのオプションが必須):

```bash
pnpm start --target-emojis ../../../icons/ --target-stickers ../../../stickers/ \
  --output ../../../README.md --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

## 規約

- 既存の `eslint.config.mjs` と `.prettierrc.yml` に従う。
- TypeScript の `skipLibCheck` を有効にしない。
- 自動テストは無い。変更したスクリプトを上記のコマンドでローカル実行し、生成物(`README.md`, `emojis.json` など)を確認する。CI(`.github/workflows/nodejs-multi-ci.yml`)は各スクリプトで `lint` と `depcheck` を実行するため、push 前に `pnpm lint` を通す。
- 画像やメタデータを変更した後は `generate-readme` を実行して `README.md` を更新する。
- ブランチは Conventional Branch(`feat/`, `fix/`, `chore/` など)、コミットは Conventional Commits に従う。
- `DISCORD_TOKEN` などの認証情報をコミットしない。値をログに出力しない。GitHub Actions の secrets 経由で渡す。
- Renovate が作成した PR にはコミットを追加しない。
