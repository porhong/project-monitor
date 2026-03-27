"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await signUp.email({ name, email, password })
      if (result.error) {
        setError(result.error.message ?? "Sign up failed")
        return
      }
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="animate-auth-fade-up w-full max-w-sm">
      {/* Mobile-only branding (hidden on desktop where left panel shows it) */}
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-foreground/5">
          <span className="font-mono text-[10px] font-bold tracking-widest">PM</span>
        </div>
        <span className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Project Monitor
        </span>
      </div>

      <div className="mb-8">
        <h2 className="font-mono text-2xl font-bold tracking-tight">Create account</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          New accounts start with visitor access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-md border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="name"
            className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
            autoComplete="name"
            className="h-11 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="h-11 font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="h-11 pr-10 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <Button
            type="submit"
            className="h-11 w-full font-mono text-sm tracking-wide"
            disabled={isPending}
          >
            {isPending ? "Creating account…" : "Create Account →"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
