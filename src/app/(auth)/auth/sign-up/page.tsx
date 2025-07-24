import type { Metadata } from "next"
import SignUpClient from "./SignUpClient"

export const metadata: Metadata = {
  title: "Sign up",
}

const SignUp = () => {
  return <SignUpClient />
}

export default SignUp
