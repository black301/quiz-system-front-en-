import type { Metadata } from "next"
import ForgotPasswordClient from "@/components/Auth/ForgotPasswordClient"

export const metadata: Metadata = {
  title: "Forgot Password",
}

export default function ForgotPassword() {
  return <ForgotPasswordClient />
}
