# GitHub Copilot Instructions

Guidance for Copilot code review on this repository. Focus reviews on the points below.

## Project summary

- Hosts Tomachi's Discord emojis, stickers, and icons plus their metadata, and publishes them via GitHub Pages.
- Code lives in two independent TypeScript projects under `.github/scripts/`: `fetch-tomachi-emojis` (downloads assets from Discord) and `generate-readme` (builds `README.md` from those assets).

## Tech stack

- TypeScript on Node.js, executed with tsx. Package manager: pnpm (enforced by `only-allow pnpm`).
- Key libraries: axios, sharp, yargs.

## Coding standards to enforce

- Insert a half-width space between Japanese and alphanumeric characters.
- JSDoc and comments in Japanese; error messages in English.
- `skipLibCheck` must not be enabled in any `tsconfig.json`.
- Style is enforced by `eslint.config.mjs` and `.prettierrc.yml` (`pnpm lint` runs prettier, eslint, and tsc). Flag deviations from these configs rather than personal preference.

## Review focus

- Error handling around network calls (axios) and filesystem writes in `fetch-tomachi-emojis`.
- All `generate-readme` CLI options (`--target-emojis`, `--target-stickers`, `--output`, `--target-guilds`, `--emojis`, `--stickers`) are required; changes must keep them consistent with the workflow invocations in `.github/workflows/`.
- `README.md` is generated output — flag direct hand-edits to it; changes to its format belong in `.github/scripts/generate-readme/template.md`.

## Security

- Never commit credentials such as `DISCORD_TOKEN`; it is supplied via GitHub Actions secrets. Flag any hardcoded tokens or secret values written to logs.

## Testing

- There are no automated tests. Do not request test additions as a matter of course; verification is done by running the scripts and checking their generated output.

## Known non-issues (do not flag)

- The absence of a root `package.json`: each script under `.github/scripts/` is its own pnpm project by design.
- Large committed data files (`emojis.json`, `README.md`, image assets): these are generated artifacts intentionally tracked in the repository.
