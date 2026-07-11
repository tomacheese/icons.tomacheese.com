# CLAUDE.md

## Project overview

- Hosts Tomachi's Discord emojis, stickers, and icons, plus their metadata, and publishes them via GitHub Pages (`CNAME`).
- Two TypeScript scripts under `.github/scripts/` do the work: `fetch-tomachi-emojis` downloads assets from Discord, and `generate-readme` builds the `README.md` catalog from those assets.
- Both scripts run in CI (see `.github/workflows/`); the repository is data-driven and rarely needs manual code changes.

## Repository layout

- `icons/`, `stickers/`: downloaded image assets.
- `emojis.json`, `stickers.json`: metadata written by `fetch-tomachi-emojis`.
- `targetGuilds.json`: Discord guild IDs to fetch from (input).
- `README.md`: auto-generated catalog. Do not hand-edit; regenerate with `generate-readme`.
- `.github/scripts/fetch-tomachi-emojis/`, `.github/scripts/generate-readme/`: independent pnpm projects (each has its own `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`).
- `.github/scripts/generate-readme/template.md`: README template consumed by `generate-readme`.

## Development commands

Run commands inside the specific script directory. Each project uses pnpm (enforced by `only-allow pnpm`) and tsx.

```bash
cd .github/scripts/<fetch-tomachi-emojis|generate-readme>
pnpm install
pnpm lint   # run-z: prettier --check, eslint, tsc
pnpm fix    # run-z: prettier --write, eslint --fix
```

`fetch-tomachi-emojis` (requires `DISCORD_TOKEN` in the environment):

```bash
pnpm start --output-emojis ../../../icons/ --output-stickers ../../../stickers/ \
  --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

`generate-readme` (all options are required):

```bash
pnpm start --target-emojis ../../../icons/ --target-stickers ../../../stickers/ \
  --output ../../../README.md --target-guilds ../../../targetGuilds.json \
  --emojis ../../../emojis.json --stickers ../../../stickers.json
```

## Coding conventions

- Insert a half-width space between Japanese and alphanumeric characters.
- Comments and JSDoc: Japanese. Error messages: English.
- Do not enable TypeScript `skipLibCheck`.
- Follow the existing `eslint.config.mjs` and `.prettierrc.yml`; do not introduce new style deviations.

## Testing

- No automated tests exist. Verify changes by running the affected script locally with the arguments above and confirming the generated output (`README.md`, `emojis.json`, etc.) is correct.
- CI (`.github/workflows/nodejs-multi-ci.yml`) runs `lint` for each script directory; ensure `pnpm lint` passes before pushing.

## Documentation update rules

- After adding or changing icons/stickers/emojis, run `generate-readme` to refresh `README.md`. Never edit `README.md` by hand.
- If the README format needs to change, edit `.github/scripts/generate-readme/template.md`, not the generated output.

## Repository-specific rules

- Conventional Commits for messages; Conventional Branch (`feat/`, `fix/`, `chore/`) for branches.
- Never commit credentials such as `DISCORD_TOKEN`; it is provided via GitHub Actions secrets. Do not log secret values.
- Do not add commits to Renovate-created PRs.
