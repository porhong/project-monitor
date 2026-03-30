export async function register() {
  // Only run in the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Drizzle migrations (project tables) — run automatically on import
    await import("@/lib/db")

    // 2. better-auth migrations (user / session / account / verification tables)
    //    File-based SQLite does NOT auto-migrate; getMigrations is the official
    //    programmatic API exposed at better-auth/db/migration.
    const { auth } = await import("@/lib/auth")
    const { getMigrations } = await import("better-auth/db/migration")
    const { runMigrations } = await getMigrations(auth.options)
    await runMigrations()

    // 3. Seed default admin (tables guaranteed to exist by this point)
    const { seedDefaultAdmin } = await import("@/lib/seed")
    await seedDefaultAdmin()
  }
}
