"use client"

import Image from "next/image"
import Link from "next/link"
import type { FormEvent, ChangeEvent } from "react"
import { useState } from "react"
import "@/css/satoshi.css"
import "@/css/style.css"

interface FormData {
  firstName: string
  lastName: string
  email: string
  department: string
  password: string
  confirmPassword: string
}

const SignUpClient = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted:", formData)
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Register for company system access</p>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    <option value="it">IT</option>
                    <option value="hr">Human Resources</option>
                    <option value="finance">Finance</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Create Account
                </button>
              </form>

              {/* Navigation Links */}
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/sign-in"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in here
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Simple Branding */}
            <div className="hidden lg:block lg:w-1/2 bg-gray-50 dark:bg-gray-700">
              <div className="h-full flex flex-col justify-center items-center p-12">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Team</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">Get access to company resources and tools</p>

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

export default SignUpClient
