# Coding Standards

## TypeScript

- **Never use `any`** — use `unknown` for truly unknown types, then narrow with type guards or assertions
- Prefer explicit return types on all exported functions and components
- Use `interface` for object shapes that may be extended; use `type` for unions, intersections, and aliases
- Use `satisfies` operator to validate literals against a type without widening
- Enable strict mode — all code must pass `npm run typecheck` with zero errors
- Use `as const` for immutable literal objects and arrays
- Avoid type assertions (`as Foo`) except at system boundaries (API responses, external libs)

## React & Next.js

- Use **React Server Components** by default; add `"use client"` only when strictly required (event handlers, hooks, browser APIs)
- Colocate data fetching in Server Components — do not fetch in client components when avoidable
- Prefer `async/await` in Server Components over `useEffect` + state for data loading
- Use Next.js `<Image>` for all images; never use raw `<img>`
- Use Next.js `<Link>` for all internal navigation; never use raw `<a>` for same-origin links
- Wrap async Server Component trees in `<Suspense>` with meaningful fallbacks
- Use `loading.tsx` / `error.tsx` route segments for top-level loading and error states

## shadcn/ui Components

- **Always use shadcn/ui components** — never build custom UI primitives from scratch when a shadcn component exists
- Install missing components via `npx shadcn@latest add <component>` before implementing
- Import from `@/components/ui/<component>` — never from `radix-ui` directly unless shadcn does not wrap it
- Extend shadcn components via `className` prop using the `cn()` helper — do not override their internal styles with arbitrary CSS
- Prefer composing shadcn primitives (e.g., `Card`, `Button`, `Dialog`) over one-off div structures

## Styling

- Use **Tailwind CSS v4** utility classes exclusively — no inline styles, no CSS modules, no styled-components
- Use the `cn()` helper from `@/lib/utils` to merge conditional classes
- Apply CSS variables (defined in globals.css) for all colors and design tokens — never hardcode hex or rgb values
- Sort Tailwind classes with Prettier (enforced by `prettier-plugin-tailwindcss`)

## Performance

- Memoize expensive computations with `useMemo`; stabilize callback references with `useCallback` when passed as props
- Avoid unnecessary `"use client"` boundaries — keep them as leaf nodes in the component tree
- Use dynamic imports (`next/dynamic`) for large client-side components that are not needed on initial paint
- Avoid layout shift: always specify `width`/`height` on `<Image>` or use `fill` with a sized container
- Prefer `generateStaticParams` + static rendering over dynamic rendering where data allows

## Code Quality

- No `console.log` in committed code — use proper error boundaries or server-side logging
- Functions should do one thing — extract helpers rather than writing deeply nested logic
- Name booleans with `is`, `has`, `can`, or `should` prefixes (e.g., `isLoading`, `hasError`)
- Destructure props at the top of the component; define prop types directly above the component
- Keep component files under ~200 lines; split larger components into sub-components in the same directory
