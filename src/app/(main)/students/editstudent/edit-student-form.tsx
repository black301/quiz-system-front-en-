"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"

interface EditStudentFormProps {
  studentId: number
  onBack: () => void
}

interface StudentFormData {
  name: string
  email: string
  password: string
  level: number
}

export function EditStudentForm({ studentId, onBack }: EditStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    password: "",
    level: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch existing student data
  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Since there's no specific GET endpoint for a single student,
      // we'll fetch all students and find the one we need
      const students = await apiFetch("/instructor/students/")
      const student = students.find((s: any) => s.id === studentId)

      if (student) {
        setFormData({
          name: student.name,
          email: student.email,
          password: "", // Don't pre-fill password for security
          level: student.level,
        })
      } else {
        setError("Student not found")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch student data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Only include fields that have values (don't send empty password)
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        level: formData.level,
      }

      // Only include password if it's been changed
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      const response = await apiFetch(`/instructor/students/${studentId}/update/`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      })

      console.log("Student updated successfully:", response)
      setSuccess(true)

      // Go back after successful update
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner"
      case 2:
        return "Intermediate"
      case 3:
        return "Advanced"
      case 4:
        return "Expert"
      default:
        return "Unknown"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-body-color dark:text-dark-6">Loading student data...</span>
        </div>
      </div>
    )
  }

  // Success message component
  if (success) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">Student Updated Successfully!</h3>
          <p className="text-center text-body-color dark:text-dark-6">
            Student "{formData.name}" has been updated successfully.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      <div className="mb-7.5">
        <button onClick={onBack} className="mb-3 flex items-center text-primary hover:text-primary/80">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Student Details
        </button>
        <h3 className="text-2xl font-bold text-dark dark:text-white">Edit Student</h3>
        <p className="text-body-color dark:text-dark-6">Update student information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-[7px] bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Student Name */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Student Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter student's full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Email Address */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Email Address <span className="text-red">*</span>
          </label>
          <input
            type="email"
            placeholder="Enter student's email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Password and Level Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              New Password <span className="text-body-color dark:text-dark-6">(Leave blank to keep current)</span>
            </label>
            <input
              type="password"
              placeholder="Enter new password (optional)"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              minLength={6}
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Level <span className="text-red">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange("level", Number.parseInt(e.target.value))}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            >
              <option value={1}>Level 1 - Beginner</option>
              <option value={2}>Level 2 - Intermediate</option>
              <option value={3}>Level 3 - Advanced</option>
              <option value={4}>Level 4 - Expert</option>
            </select>
          </div>
        </div>

        {/* Level Description */}
        <div className="mb-6 rounded-[7px] bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
            Selected Level: {getLevelName(formData.level)}
          </h4>
          <p className="text-xs text-body-color dark:text-dark-6">
            {formData.level === 1 && "Suitable for students who are new to the subject matter."}
            {formData.level === 2 && "For students with basic understanding and some experience."}
            {formData.level === 3 && "For students with solid foundation and good comprehension."}
            {formData.level === 4 && "For students with extensive knowledge and expertise."}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Updating Student..." : "Update Student"}
        </button>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-dark dark:text-white">Updating student...</span>
          </div>
        </div>
      )}
    </div>
  )
}
