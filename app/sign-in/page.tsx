import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SignInForm } from "@/components/auth/sign-in-form"
import Image from "next/image"

export const metadata = { title: "Sign In — Project Monitor" }

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/")

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Decorative left panel — always dark */}
      <div className="auth-dot-grid relative hidden flex-col justify-between bg-zinc-950 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/3 via-transparent to-transparent" />

        {/* Monogram + name */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative h-9 w-9">
            <Image
              width={36}
              height={36}
              src="/logo.webp"
              alt="Project Monitor"
              className="h-full w-full object-contain p-1"
            />
          </div>
          <span className="font-mono text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
            Project Monitor
          </span>
        </div>

        {/* Large wordmark */}
        <div className="relative z-10">
          <p className="mb-4 font-mono text-xs tracking-[0.35em] text-white/30 uppercase">
            Local · v2.0
          </p>
          <h1 className="font-mono text-[3.25rem] font-bold leading-[1.05] tracking-tight text-white">
            Track.
            <br />
            Monitor.
            <br />
            <span className="text-white/30">Deliver.</span>
          </h1>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/40">
            Centralized visibility into your projects, modules, and release versions — all in one place.
          </p>
        </div>

        {/* Status row */}
        <div className="relative z-10 flex flex-col gap-2.5">
          {(
            [
              { label: "System", value: "Operational" },
              { label: "Auth", value: "Better Auth" },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/25">{label}</span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/80" />
                <span className="font-mono text-xs text-white/40">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex items-center justify-center px-6 py-16">
        <SignInForm />
      </div>
    </div>
  )
}
