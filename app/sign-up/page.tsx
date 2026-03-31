import { redirect } from "next/navigation"

export const metadata = { title: "Sign In — Project Monitor" }

export default function SignUpPage() {
  redirect("/sign-in")
}
