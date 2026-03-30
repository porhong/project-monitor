import { createAccessControl } from "better-auth/plugins/access"

/**
 * Access control statements — mirrors the Better Auth admin plugin's
 * built-in resources and actions.
 */
const statement = {
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
} as const

export const ac = createAccessControl(statement)

/** Super Admin — full control over users and sessions */
export const superAdmin = ac.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
  ],
  session: ["list", "revoke", "delete"],
})

// Better Auth requires every assignable role to appear in the `roles` config.
// `ac.newRole({})` produces a type where the `authorize` generic resolves to
// `never` (no permission keys), which is incompatible with the `Role` type that
// expects `request: any`. We use `as unknown as` at this library boundary to
// satisfy TypeScript while preserving the correct runtime behaviour (no permissions).
type AnyRole = typeof superAdmin

/** Admin — no management permissions; read-only access */
export const adminRole = ac.newRole({}) as unknown as AnyRole

/** Visitor — no management permissions; read-only access */
export const visitor = ac.newRole({}) as unknown as AnyRole
