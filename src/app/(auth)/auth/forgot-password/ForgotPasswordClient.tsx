"use client"

import Image from "next/image"
import Link from "next/link"
import type { FormEvent, ChangeEvent } from "react"
import { useState } from "react"
import "@/css/satoshi.css"
import "@/css/style.css"

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Password reset requested for:", email)
    setIsSubmitted(true)
  }

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              {/* Success Message */}
              {isSubmitted ? (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Password reset link has been sent to your email address.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form */
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="john.doe@company.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      If you don't receive an email within a few minutes, please contact the IT department for
                      assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="mt-6 text-center space-y-2">
                <div>
                  <Link
                    href="/auth/sign-in"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Back to Sign In
                  </Link>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Need an account?{" "}
                  <Link
                    href="/auth/sign-up"
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Password Recovery</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">We'll help you get back into your account</p>

                  <div className="w-64 h-64 mx-auto">
                    <Image
                      src="/images/grids/grid-02.svg"
                      alt="Company Illustration"
                      width={256}
                      height={256}
                      className="opacity-20 dark:opacity-10"
                    />
                  </div>

                  {/* Steps */}
                  <div className="mt-8 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">How it works:</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                          1
                        </span>
                        Enter your email address
                      </div>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                          2
                        </span>
                        Check your email for reset link
                      </div>
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                          3
                        </span>
                        Create a new password
                      </div>
                    </div>
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
