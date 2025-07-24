import Signin from "@/components/Auth/Signin"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import "@/css/satoshi.css"
import "@/css/style.css"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              {/* Logo */}
              <div className="mb-8">
                <Link href="/" className="inline-block">
                  <Image
                    className="hidden dark:block"
                    src="/images/logo/logo.svg"
                    alt="Company Logo"
                    width={160}
                    height={32}
                  />
                  <Image
                    className="dark:hidden"
                    src="/images/logo/logo-dark.svg"
                    alt="Company Logo"
                    width={160}
                    height={32}
                  />
                </Link>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Access your company dashboard</p>
              </div>

              {/* Form */}
              <div className="mb-6">
                <Signin />
              </div>

              {/* Navigation Links */}
              <div className="space-y-4 text-center">
                <div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Need an account?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Simple Branding */}
            <div className="hidden lg:block lg:w-1/2 bg-gray-50 dark:bg-gray-700">
              <div className="h-full flex flex-col justify-center items-center p-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Portal</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">Internal system for authorized personnel only</p>

                  <div className="w-64 h-64 mx-auto">
                    <Image
                      src="/images/grids/grid-02.svg"
                      alt="Company Illustration"
                      width={256}
                      height={256}
                      className="opacity-20 dark:opacity-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">For technical support, contact IT department</p>
        </div>
      </div>
    </div>
  )
}
