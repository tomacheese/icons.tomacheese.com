# GitHub Copilot Instructions

## プロジェクト概要
- 目的: Tomachi アイコン・絵文字・ステッカーの管理および公開
- 主な機能: アイコン・絵文字・ステッカーの保存、自動的な絵文字取得、README の生成
- 対象ユーザー: Tomachi アイコンの利用者およびメンテナ

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック
- 言語: TypeScript
- 実行環境: Node.js (tsx)
- パッケージマネージャー: pnpm
- 主要ライブラリ: axios, sharp, yargs

## 開発コマンド
スクリプトは `.github/scripts/` 内の各ディレクトリにあります。

### fetch-tomachi-emojis
```bash
cd .github/scripts/fetch-tomachi-emojis
pnpm install
pnpm start  # 絵文字・ステッカーの取得
pnpm lint   # Lint 実行
pnpm fix    # Lint 自動修正
```

### generate-readme
```bash
cd .github/scripts/generate-readme
pnpm install
pnpm start -- --target-emojis ../../emojis --output ../../README.md  # README の生成
# もしくはヘルプを参照:
# pnpm start -- --help
pnpm lint   # Lint 実行
pnpm fix    # Lint 自動修正
```

## コーディング規約
- TypeScript の `skipLibCheck` は使用しない。
- 関数やインターフェースには日本語で JSDoc を記載する。
- エラーメッセージは英語で記載する。
- 既存の `eslint.config.mjs` および Prettier 設定に従う。

## テスト方針
- 現在、自動テストは導入されていません。

## セキュリティ / 機密情報
- Discord トークンなどの認証情報をコミットしない。
- ログに機密情報を出力しない。

## ドキュメント更新
- アイコンの追加時は、`generate-readme` スクリプトを実行して `README.md` を更新する。
