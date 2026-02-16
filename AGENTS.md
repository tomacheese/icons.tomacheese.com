# AGENTS.md

## 目的
エージェント共通の作業方針を定義します。

## 基本方針
- 会話言語: 日本語
- コメント言語: 日本語
- エラーメッセージ: 英語
- コミット規約: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## 判断記録のルール
- 重要な意思決定については、判断内容、代替案、採用理由、前提条件を明示する。

## 開発手順（概要）
1. プロジェクト構成と既存コードの理解
2. スクリプトディレクトリでの `pnpm install`
3. 実装および `pnpm fix` によるフォーマット修正
4. 動作確認および `pnpm lint` での検証

## セキュリティ / 機密情報
- Discord トークン等の認証情報を絶対にコミットしない。
- ログに機密情報を出力しない。

## リポジトリ固有
- アイコン画像は `icons/` に追加します。
- ステッカー画像は `stickers/` に追加します。
- `emojis.json` は `.github/scripts/fetch-tomachi-emojis` で更新されます。
- `stickers.json` は `.github/scripts/fetch-tomachi-emojis` で更新されます。
- `README.md` は `.github/scripts/generate-readme` で更新されます。
