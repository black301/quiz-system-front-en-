"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { CreateStudentForm } from "../createstudent/CreateStudentForm";
import { EditStudentForm } from "../editstudent/edit-student-form";
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
} from "lucide-react";

interface Student {
  id: number;
  email: string;
  name: string;
  level: number;
}

type ViewMode = "list" | "detail" | "create" | "edit";

export default function StudentManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // Customize this as needed

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setError(null);
      const data = await apiFetch("/instructor/students/all");
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("detail");
  };

  const handleCreateStudent = () => {
    setViewMode("create");
  };

  const handleEditStudent = () => {
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedStudent(null);
    setError(null);
    setSuccessMessage(null);
    // Refresh the student list
    fetchStudents();
  };

  const handleBackToDetail = () => {
    setViewMode("detail");
    setError(null);
    setSuccessMessage(null);
  };

  const handleAssignToCourse = async () => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await apiFetch(
        `/instructor/students/${selectedStudent.id}/assign-courses/`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      setSuccessMessage(response.detail);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to assign student to course",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCourse = async () => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await apiFetch(
        `/instructor/students/${selectedStudent.id}/remove/`,
        {
          method: "DELETE",
        },
      );
      setSuccessMessage(response.detail);
      setShowRemoveDialog(false);
      setTimeout(() => {
        setSuccessMessage(null);
        handleBackToList();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove student from course",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 4:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      default:
        return "Unknown";
    }
  };

  // Create Mode - Show CreateStudentForm
  if (viewMode === "create") {
    return <CreateStudentForm onBack={handleBackToList} />;
  }

  // Edit Mode - Show EditStudentForm
  if (viewMode === "edit" && selectedStudent) {
    return (
      <EditStudentForm
        studentId={selectedStudent.id}
        onBack={handleBackToDetail}
      />
    );
  }

  // Detail Mode - Show student details
  if (viewMode === "detail" && selectedStudent) {
    return (
      <div className="rounded-[10px] bg-white px-4 pb-4 pt-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-6 lg:px-7.5 lg:pt-7.5">
        {/* Header */}

        <div className="mb-6 lg:mb-7.5">
          <button
            onClick={handleBackToList}
            className="mb-4 flex items-center text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student List
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h3 className="mb-1 text-xl font-bold text-dark dark:text-white sm:text-2xl">
                {selectedStudent.name}
              </h3>
              <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
                {selectedStudent.email}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${getLevelBadgeColor(selectedStudent.level)}`}
              >
                Level {selectedStudent.level} -{" "}
                {getLevelName(selectedStudent.level)}
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEditStudent}
                  className="flex items-center rounded-lg border border-blue-200 bg-transparent px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 sm:px-4 sm:text-sm"
                >
                  <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Edit Student</span>
                  <span className="sm:hidden">Edit</span>
                </button>

                <button
                  onClick={handleAssignToCourse}
                  disabled={isLoading}
                  className="flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  <UserPlus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {isLoading ? "Assigning..." : "Assign to Course"}
                  </span>
                  <span className="sm:hidden">
                    {isLoading ? "..." : "Assign"}
                  </span>
                </button>

                <button
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isLoading}
                  className="flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {isLoading ? "Removing..." : "Remove"}
                  </span>
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20 sm:p-4">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 sm:h-5 sm:w-5" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200 sm:text-base">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20 sm:p-4">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" />
              <p className="text-sm text-red-800 dark:text-red-200 sm:text-base">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Student Details */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Student ID
            </h4>
            <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
              #{selectedStudent.id}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Email Address
            </h4>
            <p className="break-all text-base font-semibold text-dark dark:text-white sm:text-lg">
              {selectedStudent.email}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:col-span-2 lg:col-span-1">
            <h4 className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Level
            </h4>
            <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
              Level {selectedStudent.level} -{" "}
              {getLevelName(selectedStudent.level)}
            </p>
          </div>
        </div>

        {/* Student Information */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-base font-semibold text-dark dark:text-white sm:text-lg">
            Student Information
          </h4>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Full Name:
              </span>
              <span className="text-sm text-dark dark:text-white sm:text-base">
                {selectedStudent.name}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Email:
              </span>
              <span className="break-all text-sm text-dark dark:text-white sm:text-base">
                {selectedStudent.email}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Current Level:
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(selectedStudent.level)} w-fit`}
              >
                Level {selectedStudent.level} -{" "}
                {getLevelName(selectedStudent.level)}
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
            <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800 sm:p-6">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <h3 className="text-base font-semibold sm:text-lg">
                    Remove Student
                  </h3>
                </div>
                <button
                  onClick={() => setShowRemoveDialog(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedStudent.name}
                  </span>{" "}
                  from your course? This action cannot be undone.
                </p>

                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20 sm:p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" />
                    <div className="text-xs text-red-800 dark:text-red-200 sm:text-sm">
                      <p className="mb-1 font-medium">This will:</p>
                      <ul className="list-inside list-disc space-y-1 text-red-700 dark:text-red-300">
                        <li>Remove the student from your course</li>
                        <li>Revoke their access to course materials</li>
                        <li>Delete their progress data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col justify-end gap-2 sm:flex-row sm:gap-3">
                <button
                  onClick={() => setShowRemoveDialog(false)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveFromCourse}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
    );
  }

  // List Mode - Show student list
  return (
    <div className="rounded-[10px] bg-white px-4 pb-4 pt-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-6 lg:px-7.5 lg:pt-7.5">
      {/* Header */}
      <div className="mb-6 lg:mb-7.5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white sm:text-2xl">
              Student Management
            </h3>
            <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
              Manage and view all your students
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <button
              onClick={fetchStudents}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleCreateStudent}
              className="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
          <RefreshCw className="h-6 w-6 animate-spin text-slate-600 sm:h-8 sm:w-8" />
          <span className="text-body-color ml-3 text-sm dark:text-dark-6 sm:text-base">
            Loading students...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" />
            <p className="text-sm text-red-800 dark:text-red-200 sm:text-base">
              {error}
            </p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 sm:h-12 sm:w-12" />
          <h3 className="mt-4 text-base font-medium text-dark dark:text-white sm:text-lg">
            No students found
          </h3>
          <p className="text-body-color mt-2 text-sm dark:text-dark-6 sm:text-base">
            You haven&apos;t added any students yet.
          </p>
          <button
            onClick={handleCreateStudent}
            className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Student
          </button>
        </div>
      ) : filteredStudents.length == 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">
            No students found
          </h3>
          <p className="text-body-color mt-2 dark:text-dark-6">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 font-medium text-white">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-dark dark:text-white">
                            {student.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      {student.email}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(student.level)}`}
                      >
                        Level {student.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      #{student.id}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length > pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="rounded-md bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-md bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="space-y-4 lg:hidden">
            {paginatedStudents.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 font-medium text-white">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-dark dark:text-white sm:text-base">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        #{student.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(student.level)}`}
                  >
                    Level {student.level}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="break-all text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                    {student.email}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleViewStudent(student)}
                    className="flex items-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredStudents.length > pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="rounded-md bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-md bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
