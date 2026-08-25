# devdeck

The developer tools you keep googling, in one place. Everything runs in the
browser — nothing you paste ever leaves your machine.

## Tools

- **JWT** — decode a token into header and payload, or encode a new one with
  your own secret. `iat` and `exp` are rendered as real dates.
- **JSON formatter** — format, minify and validate, with syntax highlighting.
- **Cron parser** — turn a cron expression into plain language and preview the
  next 5 to 50 runs.
- **Hash generator** — MD5, SHA-1, SHA-256, SHA-384 and SHA-512 from text.
- **bcrypt** — hash text with a configurable cost factor, or compare a value
  against an existing hash.
- **Base64 converter** — encode and decode in both directions.
- **UUID generator** — v1, v4, v6 and v7, one or many at a time.

## Why it runs locally

These tools normally mean pasting a token, a payload or a password into a
stranger's website and hoping for the best. devdeck does the same work with the
same libraries, in your own tab. There is no backend to send anything to.

## Stack

React 19, TypeScript, TanStack Router, Tailwind CSS and shadcn/ui, bundled with
Vite. CodeMirror powers the editors.

## Development

```bash
pnpm install
pnpm dev
```

`pnpm build` type-checks and bundles. `pnpm typecheck`, `pnpm lint` and
`pnpm format` do what they say.

## Architecture

Every tool is isolated under `src/features/<tool>/`, so adding or removing one
never touches the rest. That decision and the others behind the project are
written down in [docs/adr](docs/adr).
