import type { Metadata } from "next"
import ForgotPasswordClient from "./ForgotPasswordClient"

export const metadata: Metadata = {
  title: "Forgot Password",
}

export default function ForgotPassword() {
  return <ForgotPasswordClient />
}
