# devdeck

**Live at [gorkadev.com/devdeck](https://gorkadev.com/devdeck)**

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

## Deploying

Pushing to `main` builds and deploys through GitHub Actions. To deploy by hand:

```bash
pnpm cf:deploy
```

The app is served by its own Cloudflare Worker on the route
`gorkadev.com/devdeck*`, separate from the Worker that owns the apex. Three
things have to agree on that prefix, and the app breaks in a different way if
any of them drifts:

| Setting | Where | If it is wrong |
|---------|-------|----------------|
| `base: "/devdeck/"` | `vite.config.ts` | Assets are requested from `/assets/…`, fall outside the route, and the landing page answers instead |
| `outDir: "dist/devdeck"` | `vite.config.ts` | The built files no longer mirror the URL path |
| `basepath: "/devdeck"` | `createRouter` in `src/main.tsx` | Every internal link points outside the app |
| `cp dist/devdeck/index.html dist/index.html` | the `build` script | Deep links such as `/devdeck/jwt-decoder` return 404 |

That last one is not a workaround for a bug, it is how Workers static assets
work: the `single-page-application` fallback always serves `/index.html` from
the root of the assets directory, never the nearest one. Since the build lives
in `dist/devdeck/`, the root needs its own copy of the shell. The copy still
references `/devdeck/assets/…` in absolute terms, so it boots correctly.

## Architecture

Every tool is isolated under `src/features/<tool>/`, so adding or removing one
never touches the rest. That decision and the others behind the project are
written down in [docs/adr](docs/adr).
