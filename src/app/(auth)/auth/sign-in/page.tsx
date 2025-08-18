import SigninWithPassword from "@/components/Auth/SigninWithPassword";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import "@/css/satoshi.css";
import "@/css/style.css";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="flex">
            {/* Left Side - Form */}
            <div className="w-full p-8 lg:w-1/2 lg:p-12">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sign In
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Access your company dashboard
                </p>
              </div>

              {/* Form */}
              <div className="mb-6">
                <SigninWithPassword />
              </div>
            </div>

            {/* Right Side - Simple Branding */}
            <div className="hidden bg-gray-50 dark:bg-gray-700 lg:block lg:w-1/2">
              <div className="flex h-full flex-col items-center justify-center p-12">
                <div className="text-center">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Company Portal
                  </h2>
                  <p className="mb-8 text-gray-600 dark:text-gray-300">
                    Internal system for authorized personnel only
                  </p>

                  <div className="mx-auto h-64 w-64">
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For technical support, contact IT department
          </p>
        </div>
      </div>
    </div>
  );
}
