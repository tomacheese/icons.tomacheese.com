# GEMINI.md

## 目的
Gemini CLI 向けのコンテキストと作業方針を定義します。

## 出力スタイル
- 言語: 日本語
- トーン: プロフェッショナルかつ簡潔
- 形式: Monospace でのレンダリングを想定した Markdown

## 共通ルール
- 会話言語: 日本語
- コミット規約: Conventional Commits
- 日本語と英数字の間には半角スペースを入れる

## プロジェクト概要
- 目的: Tomachi アイコン・絵文字のホスティングとメタデータ管理
- 主な機能: Discord 絵文字の自動取得、カタログ (README) の自動生成

## コーディング規約
- 言語: TypeScript
- コメント: 日本語
- エラーメッセージ: 英語
- `skipLibCheck` の使用禁止

## 開発コマンド
`.github/scripts/` 下の各プロジェクトで `pnpm` を使用します。

```bash
pnpm install
pnpm start
pnpm lint
pnpm fix
```

## 注意事項
- 認証情報のコミット禁止
- 既存の命名規則やディレクトリ構成を優先
- README は自動生成されるため、直接編集する際はテンプレート (`.github/scripts/generate-readme/src/template.md`) を確認すること

## リポジトリ固有
- 新しいアイコンが追加された場合、エージェントは README の更新スクリプトを提案または実行すべきです。
