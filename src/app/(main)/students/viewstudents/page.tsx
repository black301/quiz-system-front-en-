"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { CreateStudentForm } from "../createstudent/CreateStudentForm"
import { EditStudentForm } from "../editstudent/edit-student-form"
import {
  ArrowLeft,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
} from "lucide-react"

interface Student {
  id: number
  email: string
  name: string
  level: number
}

type ViewMode = "list" | "detail" | "create" | "edit"

export default function StudentManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  // Fetch all students
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true)
      setError(null)
      const data = await apiFetch("/instructor/students/all")
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students")
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setViewMode("detail")
  }

  const handleCreateStudent = () => {
    setViewMode("create")
  }

  const handleEditStudent = () => {
    setViewMode("edit")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedStudent(null)
    setError(null)
    setSuccessMessage(null)
    // Refresh the student list
    fetchStudents()
  }

  const handleBackToDetail = () => {
    setViewMode("detail")
    setError(null)
    setSuccessMessage(null)
  }

  const handleAssignToCourse = async () => {
    if (!selectedStudent) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)
      const response = await apiFetch(`/instructor/students/${selectedStudent.id}/assign-courses/`, {
        method: "POST",
        body: JSON.stringify({}),
      })
      setSuccessMessage(response.detail)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign student to course")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromCourse = async () => {
    if (!selectedStudent) return

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)
      const response = await apiFetch(`/instructor/students/${selectedStudent.id}/remove/`, {
        method: "DELETE",
      })
      setSuccessMessage(response.detail)
      setShowRemoveDialog(false)
      setTimeout(() => {
        setSuccessMessage(null)
        handleBackToList()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove student from course")
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case 4:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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

  // Create Mode - Show CreateStudentForm
  if (viewMode === "create") {
    return <CreateStudentForm onBack={handleBackToList} />
  }

  // Edit Mode - Show EditStudentForm
  if (viewMode === "edit" && selectedStudent) {
    return <EditStudentForm studentId={selectedStudent.id} onBack={handleBackToDetail} />
  }

  // Detail Mode - Show student details
  if (viewMode === "detail" && selectedStudent) {
    return (
      <div className="rounded-[10px] bg-white px-4 sm:px-6 lg:px-7.5 pb-4 pt-6 lg:pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="mb-6 lg:mb-7.5">
          <button
            onClick={handleBackToList}
            className="mb-4 flex items-center text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student List
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-dark dark:text-white mb-1">{selectedStudent.name}</h3>
              <p className="text-body-color dark:text-dark-6 text-sm sm:text-base">{selectedStudent.email}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${getLevelBadgeColor(selectedStudent.level)}`}
              >
                Level {selectedStudent.level} - {getLevelName(selectedStudent.level)}
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEditStudent}
                  className="flex items-center rounded-lg border border-blue-200 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 transition-colors"
                >
                  <Edit className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="hidden sm:inline">Edit Student</span>
                  <span className="sm:hidden">Edit</span>
                </button>

                <button
                  onClick={handleAssignToCourse}
                  disabled={isLoading}
                  className="flex items-center rounded-lg bg-emerald-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <UserPlus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="hidden sm:inline">{isLoading ? "Assigning..." : "Assign to Course"}</span>
                  <span className="sm:hidden">{isLoading ? "..." : "Assign"}</span>
                </button>

                <button
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isLoading}
                  className="flex items-center rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  <span className="hidden sm:inline">{isLoading ? "Removing..." : "Remove"}</span>
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-800 dark:text-emerald-200 text-sm sm:text-base">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Student Details */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Student ID</h4>
            <p className="text-base sm:text-lg font-semibold text-dark dark:text-white">#{selectedStudent.id}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</h4>
            <p className="text-base sm:text-lg font-semibold text-dark dark:text-white break-all">
              {selectedStudent.email}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Level</h4>
            <p className="text-base sm:text-lg font-semibold text-dark dark:text-white">
              Level {selectedStudent.level} - {getLevelName(selectedStudent.level)}
            </p>
          </div>
        </div>

        {/* Student Information */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-base sm:text-lg font-semibold text-dark dark:text-white">Student Information</h4>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Full Name:</span>
              <span className="text-dark dark:text-white text-sm sm:text-base">{selectedStudent.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
              <span className="text-dark dark:text-white text-sm sm:text-base break-all">{selectedStudent.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Current Level:</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(selectedStudent.level)} w-fit`}
              >
                Level {selectedStudent.level} - {getLevelName(selectedStudent.level)}
              </span>
            </div>
          </div>
        </div>

        {/* Remove Confirmation Modal */}
        {showRemoveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowRemoveDialog(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 sm:p-6 shadow-xl dark:bg-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                  <h3 className="text-base sm:text-lg font-semibold">Remove Student</h3>
                </div>
                <button
                  onClick={() => setShowRemoveDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-4 sm:h-5 w-4 sm:w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.name}</span> from
                  your course? This action cannot be undone.
                </p>

                <div className="rounded-lg bg-red-50 p-3 sm:p-4 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-red-800 dark:text-red-200">
                      <p className="font-medium mb-1">This will:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                        <li>Remove the student from your course</li>
                        <li>Revoke their access to course materials</li>
                        <li>Delete their progress data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => setShowRemoveDialog(false)}
                  disabled={isLoading}
                  className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveFromCourse}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // List Mode - Show student list
  return (
    <div className="rounded-[10px] bg-white px-4 sm:px-6 lg:px-7.5 pb-4 pt-6 lg:pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      <div className="mb-6 lg:mb-7.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">Student Management</h3>
            <p className="text-body-color dark:text-dark-6 text-sm sm:text-base">Manage and view all your students</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={fetchStudents}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleCreateStudent}
              className="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-slate-600" />
          <span className="text-body-color ml-3 dark:text-dark-6 text-sm sm:text-base">Loading students...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-base sm:text-lg font-medium text-dark dark:text-white">No students found</h3>
          <p className="text-body-color mt-2 dark:text-dark-6 text-sm sm:text-base">
            You haven&apos;t added any students yet.
          </p>
          <button
            onClick={handleCreateStudent}
            className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Student
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 font-medium text-white">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-dark dark:text-white">{student.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">{student.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(student.level)}`}
                      >
                        Level {student.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">#{student.id}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="flex items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 font-medium text-white">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-dark dark:text-white text-sm sm:text-base">{student.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">#{student.id}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(student.level)}`}>
                    Level {student.level}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-all">{student.email}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="flex items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
