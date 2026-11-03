# GitHub Copilot Instructions

Project overview, language rules, commands, and conventions are in [`AGENTS.md`](../AGENTS.md). Review in English.

## Review focus

- Error handling around network calls (axios) and filesystem writes in `fetch-tomachi-emojis`.
- All `generate-readme` CLI options (`--target-emojis`, `--target-stickers`, `--output`, `--target-guilds`, `--emojis`, `--stickers`) are required; keep them consistent with the workflow invocations in `.github/workflows/`.
- `README.md` is generated: flag hand-edits; format changes belong in `.github/scripts/generate-readme/template.md`.
- `skipLibCheck` must not be enabled; style follows `eslint.config.mjs` and `.prettierrc.yml`.
- Flag hardcoded tokens (`DISCORD_TOKEN`) or secrets written to logs.
- `terms.md` is intentionally Japanese; do not flag it.

## Known non-issues

- No root `package.json`: each script under `.github/scripts/` is its own pnpm project.
- No automated tests; do not request tests as a matter of course.
- Large committed data files (`emojis.json`, `README.md`, image assets) are intentional generated artifacts.
