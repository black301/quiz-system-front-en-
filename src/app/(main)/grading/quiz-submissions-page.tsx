"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { GradeSubmissionPage } from "./grade-submission-page";

interface Submission {
  id: number;
  student: number;
  student_name: string;
  quiz: number;
  submission_date: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  status: "submitted" | "graded" | "released";
  answers: any[];
}

interface Quiz {
  id: number;
  title: string;
  total_points: number;
  duration: number;
}

interface QuizSubmissionsPageProps {
  quizId: number;
  onBack: () => void;
}

type ViewMode = "list" | "grade";

export function QuizSubmissionsPage({
  quizId,
  onBack,
}: QuizSubmissionsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchQuizAndSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch quiz details and submissions in parallel
      const [quizData, submissionsData] = await Promise.all([
        apiFetch(`/quiz/${quizId}/`),
        apiFetch(`/instructor/quizzes/${quizId}/submissions/`),
      ]);

      setQuiz(quizData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quiz submissions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);
  useEffect(() => {
    fetchQuizAndSubmissions();
  }, [fetchQuizAndSubmissions]);

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewMode("grade");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSubmission(null);
    // Refresh submissions when returning from grading
    fetchQuizAndSubmissions();
  };

  const handleReleaseGrades = async () => {
    if (
      !confirm(
        "Are you sure you want to release all grades to students? This action cannot be undone.",
      )
    )
      return;

    try {
      setIsReleasing(true);
      setError(null);

      const response = await apiFetch(
        `/instructor/quizzes/${quizId}/release/`,
        {
          method: "POST",
        },
      );

      setSuccessMessage(response.detail);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh submissions to show updated status
      await fetchQuizAndSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to release grades");
    } finally {
      setIsReleasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "graded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "released":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getGradeColor = (grade: number, totalPoints: number) => {
    const percentage = (grade / totalPoints) * 100;
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const gradedCount = submissions.filter(
    (s) => s.status === "graded" || s.status === "released",
  ).length;
  const releasedCount = submissions.filter(
    (s) => s.status === "released",
  ).length;

  // Grade submission view
  if (viewMode === "grade" && selectedSubmission) {
    return (
      <GradeSubmissionPage
        submissionId={selectedSubmission.id}
        onBack={handleBackToList}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading submissions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
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
              Back to Quiz List
            </button>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              {quiz?.title} - Submissions
            </h3>
            <p className="text-body-color dark:text-dark-6">
              Grade and manage student submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuizAndSubmissions}
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
            {gradedCount > 0 && releasedCount < gradedCount && (
              <button
                onClick={handleReleaseGrades}
                disabled={isReleasing}
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {isReleasing
                  ? "Releasing..."
                  : `Release Grades (${gradedCount - releasedCount})`}
              </button>
            )}
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

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Submissions
            </h4>
            <p className="text-2xl font-bold text-dark dark:text-white">
              {submissions.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Graded
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {gradedCount}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Released
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {releasedCount}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Points
            </h4>
            <p className="text-2xl font-bold text-dark dark:text-white">
              {quiz?.total_points}
            </p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {submissions.length === 0 ? (
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
              No submissions yet
            </h3>
            <p className="text-body-color mt-2 dark:text-dark-6">
              Students haven&apos;t submitted this quiz yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Graded At
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-medium text-white">
                          {submission.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-dark dark:text-white">
                            {submission.student_name}
                          </p>
                          <p className="text-body-color text-sm dark:text-dark-6">
                            ID: {submission.student}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      {formatDate(submission.submission_date)}
                    </td>
                    <td className="px-4 py-4">
                      {submission.grade !== null ? (
                        <span
                          className={`font-medium ${getGradeColor(submission.grade, quiz?.total_points || 100)}`}
                        >
                          {submission.grade}/{quiz?.total_points} (
                          {Math.round(
                            (submission.grade / (quiz?.total_points || 100)) *
                              100,
                          )}
                          %)
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">
                          Not graded
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(submission.status)}`}
                      >
                        {submission.status.charAt(0).toUpperCase() +
                          submission.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      {submission.graded_at
                        ? formatDate(submission.graded_at)
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleGradeSubmission(submission)}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        {submission.status === "submitted" ? "Grade" : "Review"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
