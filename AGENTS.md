# AGENTS.md

## Language

- Deliverables are written in English: commit messages, PR/Issue titles and bodies, review comments, code comments/JSDoc, and documentation. Error messages are English as well.
- Exception: `terms.md` (the icon usage terms) stays in Japanese. Do not translate or edit it as part of language cleanup.

## Project overview

- Hosts Tomachi's Discord emojis, stickers, and icons plus their metadata, and publishes them via GitHub Pages (`CNAME`, https://icons.tomacheese.com).
- Two independent TypeScript projects under `.github/scripts/` do the work: `fetch-tomachi-emojis` downloads assets from Discord, and `generate-readme` builds the `README.md` catalog from them.
- Both run in CI (`.github/workflows/`); the repository is data-driven and rarely needs manual code changes. The default branch is `master`.

## Repository layout

- `icons/`, `stickers/`: downloaded image assets.
- `emojis.json`, `stickers.json`: metadata written by `fetch-tomachi-emojis`.
- `targetGuilds.json`: Discord guild IDs (and names) to fetch from (input).
- `README.md`: generated catalog. Do not hand-edit.
- `terms.md`: icon usage terms (Japanese).
- `.github/scripts/generate-readme/template.md`: README template.
- Each script directory has its own `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`; there is no root `package.json`.

## Development commands

Run inside the script directory (`.github/scripts/fetch-tomachi-emojis` or `.github/scripts/generate-readme`). Package manager is pnpm (enforced by `only-allow pnpm`); scripts run with tsx.

```bash
pnpm install --frozen-lockfile
pnpm lint   # prettier --check, eslint, tsc
pnpm fix    # prettier --write, eslint --fix
```

`fetch-tomachi-emojis` (requires `DISCORD_TOKEN`):

```bash
pnpm start --output-emojis ../../../icons/ --output-stickers ../../../stickers/ \
  --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

`generate-readme` (all options required):

```bash
pnpm start --target-emojis ../../../icons/ --target-stickers ../../../stickers/ \
  --output ../../../README.md --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

## Conventions

- Follow `eslint.config.mjs` and `.prettierrc.yml`; do not enable `skipLibCheck`.
- To change the README format, edit `template.md` (or `generate-readme/src/main.ts` for the tables) and regenerate; never edit `README.md` by hand.
- Conventional Commits; Conventional Branch (`feat/`, `fix/`, `chore/`). Do not add commits to Renovate PRs.
- Never commit credentials such as `DISCORD_TOKEN` (provided via GitHub Actions secrets) or log secret values.

## Testing

- There are no automated tests. Verify by running the affected script and checking the generated output.
- CI (`.github/workflows/nodejs-multi-ci.yml`) runs `pnpm lint` and `depcheck` in each script directory.
