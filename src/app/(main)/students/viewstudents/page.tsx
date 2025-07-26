"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { CreateStudentForm } from "../createstudent/CreateStudentForm";
import { EditStudentForm } from "../editstudent/edit-student-form";

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

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      setError(null);
      const data = await apiFetch("/instructor/students/");
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
    if (
      !confirm(
        `Are you sure you want to remove ${selectedStudent.name} from your course?`,
      )
    )
      return;

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

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 4:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="mb-7.5 flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToList}
              className="mb-3 flex items-center text-primary hover:text-primary/80"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Student List
            </button>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              {selectedStudent.name}
            </h3>
            <p className="text-body-color dark:text-dark-6">
              {selectedStudent.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${getLevelBadgeColor(selectedStudent.level)}`}
            >
              Level {selectedStudent.level} -{" "}
              {getLevelName(selectedStudent.level)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleEditStudent}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Student
              </button>
              <button
                onClick={handleAssignToCourse}
                disabled={isLoading}
                className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {isLoading ? "Assigning..." : "Assign to Course"}
              </button>
              <button
                onClick={handleRemoveFromCourse}
                disabled={isLoading}
                className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {isLoading ? "Removing..." : "Remove from Course"}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-red-600 dark:text-red-400"
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

        {/* Student Details */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Student ID
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              #{selectedStudent.id}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Email Address
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              {selectedStudent.email}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Level
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              Level {selectedStudent.level} -{" "}
              {getLevelName(selectedStudent.level)}
            </p>
          </div>
        </div>

        {/* Student Information */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-lg font-semibold text-dark dark:text-white">
            Student Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Full Name:
              </span>
              <span className="text-dark dark:text-white">
                {selectedStudent.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email:
              </span>
              <span className="text-dark dark:text-white">
                {selectedStudent.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Level:
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(selectedStudent.level)}`}
              >
                Level {selectedStudent.level} -{" "}
                {getLevelName(selectedStudent.level)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List Mode - Show student list
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      <div className="mb-7.5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            Student Management
          </h3>
          <p className="text-body-color dark:text-dark-6">
            Manage and view all your students
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStudents}
            className="flex items-center rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleCreateStudent}
            className="flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading students...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center">
            <svg
              className="mr-2 h-5 w-5 text-red-600 dark:text-red-400"
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
      ) : students.length === 0 ? (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">
            No students found
          </h3>
          <p className="text-body-color mt-2 dark:text-dark-6">
            You haven&apos;t added any students yet.
          </p>
          <button
            onClick={handleCreateStudent}
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Your First Student
          </button>
        </div>
      ) : (
        /* Student Table */
        <div className="overflow-x-auto">
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
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-medium text-white">
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
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
