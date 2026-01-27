# CLAUDE.md

## 目的
Claude Code の作業方針とプロジェクト固有ルールを示します。

## 判断記録のルール
- 判断内容の要約
- 検討した代替案
- 採用しなかった案とその理由
- 前提条件・仮定・不確実性
- 他エージェントによるレビュー可否

## プロジェクト概要
- 目的: Tomachi アイコンと絵文字の管理・公開
- 主な機能: 画像アセットの管理、Discord 絵文字・ステッカー データの取得、カタログ生成

## 重要ルール
- 会話言語: 日本語
- コミット規約: Conventional Commits
- コメント言語: 日本語
- エラーメッセージ: 英語

## 環境のルール
- ブランチ命名: Conventional Branch (`feat/`, `fix/`)
- GitHub リポジトリ調査: 必要に応じてテンポラリディレクトリに clone して検索
- Renovate PR: 追加コミットや更新を行わない

## コード改修時のルール
- 日本語と英数字の間には半角スペースを挿入
- エラーメッセージの絵文字は全体で統一
- TypeScript の `skipLibCheck` 禁止
- docstring (JSDoc) を日本語で記載

## 相談ルール
- Codex CLI: 実装レビュー、局所設計、整合性確認
- Gemini CLI: 外部仕様、最新情報確認
- 指摘への対応: 黙殺せず、必ず対応または理由を回答

## 開発コマンド
リポジトリ内の各スクリプトディレクトリ（`.github/scripts/*`）で実行します。

```bash
pnpm install  # 依存関係のインストール

# 利用可能なサブコマンドや必須オプションを確認
pnpm start -- --help

# 必須オプションを指定して実行する（例）
# pnpm start -- <script-name> --input <input-path> --output <output-path>

pnpm lint     # Lint 実行
pnpm fix      # 自動修正
```

## アーキテクチャと主要ファイル
- `icons/`: アイコン画像ファイル
- `stickers/`: ステッカー画像ファイル
- `emojis.json`: 取得された絵文字データ
- `targetGuilds.json`: 取得対象の Discord サーバー ID
- `.github/scripts/`: 管理用スクリプト (TypeScript)

## 作業チェックリスト

### 新規改修時
1. プロジェクト構成の理解
2. 適切な作業ブランチの作成 (`feat/` or `fix/`)
3. `pnpm install` による依存関係の解決

### コミット・プッシュ前
1. Conventional Commits の遵守
2. 機密情報（Discord Token 等）の混入確認
3. `pnpm lint` でのエラー確認
4. 動作確認

### PR 作成前
1. ユーザーへの依頼確認
2. コンフリクトの有無を確認

### PR 作成後
1. PR 本文が日本語で詳細に記載されているか確認
2. GitHub Actions CI の成功を確認
3. Copilot レビューへの対応

## リポジトリ固有
- アイコンを追加した際は、必ず `generate-readme` を実行して README を更新する必要があります。
