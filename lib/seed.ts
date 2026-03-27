import path from "path"
import BetterSQLite3 from "better-sqlite3"

export async function seedDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@projectmonitor.local"
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin@1234"
  const adminName = process.env.DEFAULT_ADMIN_NAME ?? "Admin"

  const db = new BetterSQLite3(path.join(process.cwd(), "data", "app.db"))

  try {
    // No-op if an admin already exists
    const existingAdmin = db.prepare("SELECT id FROM user WHERE role = 'admin' LIMIT 1").get()
    if (existingAdmin) return

    // If the target email already exists as a non-admin, promote it
    const existingUser = db
      .prepare("SELECT id FROM user WHERE email = ?")
      .get(adminEmail) as { id: string } | undefined

    if (existingUser) {
      db.prepare("UPDATE user SET role = 'admin' WHERE id = ?").run(existingUser.id)
      console.log(`[seed] Promoted existing user "${adminEmail}" to admin`)
      return
    }

    // Create the user through Better Auth so the password is properly hashed
    const { auth } = await import("@/lib/auth")
    const result = await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: adminName },
    })

    if (!result?.user?.id) {
      console.error("[seed] signUpEmail returned no user — skipping role promotion")
      return
    }

    db.prepare("UPDATE user SET role = 'admin' WHERE id = ?").run(result.user.id)
    console.log(`[seed] Default admin created → ${adminEmail}`)
  } catch (err) {
    console.error("[seed] Failed to seed default admin:", err)
  } finally {
    db.close()
  }
}
