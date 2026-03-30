"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { requireSuperAdmin } from "@/lib/auth-guard"
import type { UserRole } from "@/lib/auth"

async function getHeaders() {
  return await headers()
}

export async function createUser(data: {
  email: string
  name: string
  password: string
  role: UserRole
}): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.createUser({
      body: { ...data, role: data.role as unknown as "super-admin" },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create user" }
  }
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.setRole({
      body: { userId, role: role as unknown as "super-admin" },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to set role" }
  }
}

export async function banUser(userId: string): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.banUser({
      body: { userId },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to ban user" }
  }
}

export async function unbanUser(userId: string): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to unban user" }
  }
}

export async function revokeUserSessions(userId: string): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.revokeUserSessions({
      body: { userId },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to revoke sessions" }
  }
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.removeUser({
      body: { userId },
      headers: await getHeaders(),
    })
    revalidatePath("/admin/users")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete user" }
  }
}

export async function changeUserPassword(
  userId: string,
  newPassword: string,
): Promise<{ error?: string }> {
  await requireSuperAdmin()
  try {
    await auth.api.setUserPassword({
      body: { userId, newPassword },
      headers: await getHeaders(),
    })
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to change password" }
  }
}
