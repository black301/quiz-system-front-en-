"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { QuizSubmissionsPage } from "../quiz-submissions-page";

interface Quiz {
  id: number;
  title: string;
  course_id: number;
  course_name: string;
  week_number: number;
  start_date: string;
  end_date: string;
  duration: number;
  total_points: number;
  submission_count?: number;
  graded_count?: number;
  released_count?: number;
}

type ViewMode = "list" | "submissions";

export default function QuizGradingManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiFetch("/instructor/quizzes/");

      // Fetch submission counts for each quiz
      const quizzesWithCounts = await Promise.all(
        data.map(async (quiz: Quiz) => {
          try {
            const submissions = await apiFetch(
              `/instructor/quizzes/${quiz.id}/submissions/`,
            );
            const submissionCount = submissions.length;
            const gradedCount = submissions.filter(
              (s: any) => s.status === "graded" || s.status === "released",
            ).length;
            const releasedCount = submissions.filter(
              (s: any) => s.status === "released",
            ).length;

            return {
              ...quiz,
              submission_count: submissionCount,
              graded_count: gradedCount,
              released_count: releasedCount,
            };
          } catch {
            return {
              ...quiz,
              submission_count: 0,
              graded_count: 0,
              released_count: 0,
            };
          }
        }),
      );

      setQuizzes(quizzesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSubmissions = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setViewMode("submissions");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedQuiz(null);
    // Refresh quiz list when returning
    fetchQuizzes();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGradingProgress = (quiz: Quiz) => {
    if (!quiz.submission_count || quiz.submission_count === 0) return 0;
    return Math.round(((quiz.graded_count || 0) / quiz.submission_count) * 100);
  };

  // Submissions view
  if (viewMode === "submissions" && selectedQuiz) {
    return (
      <QuizSubmissionsPage quizId={selectedQuiz.id} onBack={handleBackToList} />
    );
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      <div className="mb-7.5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            Quiz Grading
          </h3>
          <p className="text-body-color dark:text-dark-6">
            Grade and manage quiz submissions
          </p>
        </div>
        <button
          onClick={fetchQuizzes}
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading quizzes...
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
      ) : quizzes.length === 0 ? (
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
            No quizzes found
          </h3>
          <p className="text-body-color mt-2 dark:text-dark-6">
            Create some quizzes to start grading submissions.
          </p>
        </div>
      ) : (
        /* Quiz Table */
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Quiz
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Submissions
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Grading Progress
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {quizzes.map((quiz) => {
                const gradingProgress = getGradingProgress(quiz);
                return (
                  <tr
                    key={quiz.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {quiz.title}
                        </p>
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Week {quiz.week_number} • {quiz.total_points} pts
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      {quiz.course_name}
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">
                      {formatDate(quiz.end_date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-dark dark:text-white">
                          {quiz.submission_count || 0}
                        </div>
                        <div className="text-body-color text-xs dark:text-dark-6">
                          submissions
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-body-color dark:text-dark-6">
                              {quiz.graded_count || 0}/
                              {quiz.submission_count || 0}
                            </span>
                            <span className="font-medium text-dark dark:text-white">
                              {gradingProgress}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${gradingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewSubmissions(quiz)}
                        disabled={!quiz.submission_count}
                        className="font-medium text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {quiz.submission_count
                          ? "Grade Submissions"
                          : "No Submissions"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {quizzes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Quizzes
            </h4>
            <p className="text-2xl font-bold text-dark dark:text-white">
              {quizzes.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Submissions
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {quizzes.reduce(
                (sum, quiz) => sum + (quiz.submission_count || 0),
                0,
              )}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Graded
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {quizzes.reduce((sum, quiz) => sum + (quiz.graded_count || 0), 0)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Released
            </h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {quizzes.reduce(
                (sum, quiz) => sum + (quiz.released_count || 0),
                0,
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
