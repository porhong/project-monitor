# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

@.claude/rules/coding-standards.md

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier (TypeScript/TSX files)
npm run typecheck  # Type-check without emitting
```

## Architecture

Next.js 16 App Router project with shadcn/ui components.

- `app/` — Next.js App Router pages and layouts. Root layout wraps everything in `ThemeProvider`.
- `components/ui/` — shadcn/ui components. Add new components via `npx shadcn@latest add <component>`.
- `components/theme-provider.tsx` — Dark/light theme via `next-themes`. Keyboard shortcut: press `d` to toggle (blocked when focus is in an input).
- `lib/utils.ts` — `cn()` helper that merges Tailwind classes using `clsx` + `tailwind-merge`.
- `hooks/` — Custom React hooks (currently empty).

## Key Config

- **Path alias**: `@/*` maps to project root (e.g., `@/components/ui/button`)
- **shadcn style**: `radix-nova`, base color `neutral`, CSS variables enabled
- **Prettier**: no semicolons, double quotes, trailing commas ES5, Tailwind class sorting
- **Tailwind CSS v4** — uses PostCSS plugin, not a config file
