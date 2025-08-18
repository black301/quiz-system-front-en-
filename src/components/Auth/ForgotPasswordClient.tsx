"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import "@/css/satoshi.css";
import "@/css/style.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/auth/request-password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.detail);
        setStep(2);
      } else {
        setError(data.detail || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleSubmitOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.detail);
        setStep(3);
      } else {
        setError(data.detail || "Invalid or expired OTP.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isPasswordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.detail);
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 1500);
      } else {
        setError(data.detail || "Password reset failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
          <div className="flex">
            <div className="w-full p-8 lg:w-1/2 lg:p-12">
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

              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reset Password
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {step === 1 && "Enter your email to receive a reset link"}
                  {step === 2 && "Enter the OTP sent to your email"}
                  {step === 3 && "Enter and confirm your new password"}
                </p>
              </div>

              {message && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleSubmitEmail} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmitOtp} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Verify OTP
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full rounded-md border px-3 py-2 pr-10 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {!isPasswordValid && newPassword && (
                    <p className="text-sm text-red-500">
                      Password must be at least 8 characters.
                    </p>
                  )}

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className={`w-full rounded-md border px-3 py-2 pr-10 ${
                        confirmPassword
                          ? passwordsMatch
                            ? "border-green-500"
                            : "border-red-500"
                          : ""
                      } dark:bg-gray-700 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {!passwordsMatch && confirmPassword && (
                    <p className="text-sm text-red-500">
                      Passwords do not match.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!passwordsMatch || !isPasswordValid}
                    className={`w-full rounded-md py-2 text-white ${
                      passwordsMatch && isPasswordValid
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        : "cursor-not-allowed bg-gray-400"
                    }`}
                  >
                    Reset Password
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/auth/sign-in"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>

            <div className="hidden bg-gray-50 dark:bg-gray-700 lg:block lg:w-1/2">
              <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Password Recovery
                </h2>
                <p className="mb-8 text-gray-600 dark:text-gray-300">
                  We will help you get back into your account
                </p>
                <div className="mx-auto h-64 w-64">
                  <Image
                    src="/images/grids/grid-02.svg"
                    alt="Illustration"
                    width={256}
                    height={256}
                    className="opacity-20 dark:opacity-10"
                  />
                </div>
                <div className="mt-8 text-left">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                    How it works:
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        1
                      </span>
                      Enter your email address
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        2
                      </span>
                      Check your email for the OTP
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
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

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For technical support, contact the IT department
          </p>
        </div>
      </div>
    </div>
  );
}
