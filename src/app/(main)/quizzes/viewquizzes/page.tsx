"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { EditQuizForm } from "../editquiz/EditQuizForm";

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
  created_at: string;
  updated_at: string;
  questions: Question[];
}

interface Question {
  id: number;
  quiz: number;
  question_text: string;
  question_type: string;
  correct_answer: string | null;
  points: number;
}

interface QuestionStat {
  question_id: number;
  question_text: string;
  points: number;
  correct: number;
  incorrect: number;
}

interface QuizStats {
  quiz_id: number;
  quiz_title: string;
  question_stats: QuestionStat[];
  most_missed_question: QuestionStat;
  most_correct_question: QuestionStat;
}

type ViewMode = "list" | "detail" | "edit";

export default function ViewQuizPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true);
      setError(null);
      const data = await apiFetch("/instructor/quizzes/");
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const fetchQuestions = async (quizId: number) => {
    try {
      setIsLoadingQuestions(true);
      setQuestionsError(null);
      const data = await apiFetch(`/quiz/${quizId}/`);
      setQuestions(data.questions || []);
      setSelectedQuiz(data);
    } catch (err) {
      setQuestionsError(
        err instanceof Error ? err.message : "Failed to fetch questions",
      );
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const fetchQuizStats = async (quizId: number) => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      const data = await apiFetch(
        `/instructor/statistics/question-stats/${quizId}/`,
      );
      setQuizStats(data);
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "Failed to fetch quiz statistics",
      );
      setQuizStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleViewQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setViewMode("detail");
    fetchQuestions(quiz.id);

    const status = getQuizStatus(quiz);
    if (status.status === "completed" || status.status === "active") {
      fetchQuizStats(quiz.id);
    }
  };

  const handleEditQuiz = () => {
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedQuiz(null);
    setQuestions([]);
    setQuestionsError(null);
    setQuizStats(null);
    setStatsError(null);
    fetchQuizzes();
  };

  const handleBackToDetail = () => {
    setViewMode("detail");
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id);
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

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.start_date);
    const endDate = new Date(quiz.end_date);

    if (now < startDate) {
      return {
        status: "upcoming",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    } else if (now > endDate) {
      return {
        status: "completed",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      };
    } else {
      return {
        status: "active",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setIsDeleting(true);
      setQuestionsError(null);

      console.log("Attempting to delete quiz:", selectedQuiz.id);

      await apiFetch(`/instructor/quizzes/${selectedQuiz.id}/remove/`, {
        method: "DELETE",
      });

      console.log("Quiz deleted successfully");

      setShowDeleteModal(false);
      window.location.reload();
    } catch (err) {
      console.log("Delete failed:", err);
      setQuestionsError(
        err instanceof Error ? err.message : "Failed to delete quiz",
      );
      setIsDeleting(false);
      setTimeout(() => {
        setShowDeleteModal(false);
        setQuestionsError(null);
      }, 3000);
    }
  };

  const filteredQuizzes = quizzes
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter((quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (viewMode === "edit" && selectedQuiz) {
    return (
      <EditQuizForm quizId={selectedQuiz.id} onBack={handleBackToDetail} />
    );
  }

  if (viewMode === "detail" && selectedQuiz) {
    const quizStatus = getQuizStatus(selectedQuiz);

    return (
      <>
        <div className="rounded-[10px] bg-white px-4 pb-4 pt-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-6 lg:px-7.5 lg:pt-7.5">
          <div className="mb-6 lg:mb-7.5">
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
              Back to Quiz List
            </button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-dark dark:text-white sm:text-2xl">
                  {selectedQuiz.title}
                </h3>
                <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
                  {selectedQuiz.course_name}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span
                  className={`self-start rounded-full px-3 py-1 text-sm font-medium ${quizStatus.color} sm:self-center`}
                >
                  {quizStatus.status.charAt(0).toUpperCase() +
                    quizStatus.status.slice(1)}
                </span>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {quizStatus.status === "upcoming" && (
                    <button
                      onClick={handleEditQuiz}
                      className="flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 sm:px-4"
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
                      <span className="hidden sm:inline">Edit Quiz</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 sm:px-4"
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
                    <span className="hidden sm:inline">Delete Quiz</span>
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:gap-4">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Week Number
              </h4>
              <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
                Week {selectedQuiz.week_number}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Duration
              </h4>
              <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
                {selectedQuiz.duration} min
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Total Points
              </h4>
              <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
                {selectedQuiz.total_points}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Questions
              </h4>
              <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
                {questions.length}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-3 text-base font-semibold text-dark dark:text-white sm:text-lg">
              Schedule
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                  Start Date:
                </span>
                <p className="text-sm text-dark dark:text-white sm:text-base">
                  {formatDate(selectedQuiz.start_date)}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                  End Date:
                </span>
                <p className="text-sm text-dark dark:text-white sm:text-base">
                  {formatDate(selectedQuiz.end_date)}
                </p>
              </div>
            </div>
          </div>

          {(quizStatus.status === "completed" ||
            quizStatus.status === "active") && (
            <div className="mb-6">
              <h4 className="mb-4 text-base font-semibold text-dark dark:text-white sm:text-lg">
                Quiz Statistics
              </h4>

              {isLoadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary sm:h-8 sm:w-8"></div>
                  <span className="text-body-color ml-3 text-sm dark:text-dark-6 sm:text-base">
                    Loading statistics...
                  </span>
                </div>
              ) : statsError ? (
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
                    <p className="text-sm text-red-800 dark:text-red-200 sm:text-base">
                      {statsError}
                    </p>
                  </div>
                </div>
              ) : quizStats ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                      <h5 className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
                        Most Missed Question
                      </h5>
                      <p className="mb-2 text-xs text-red-700 dark:text-red-300 sm:text-sm">
                        {quizStats.most_missed_question.question_text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                        <span>
                          Correct: {quizStats.most_missed_question.correct}
                        </span>
                        <span>
                          Incorrect: {quizStats.most_missed_question.incorrect}
                        </span>
                        <span>{quizStats.most_missed_question.points} pts</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <h5 className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
                        Most Correct Question
                      </h5>
                      <p className="mb-2 text-xs text-green-700 dark:text-green-300 sm:text-sm">
                        {quizStats.most_correct_question.question_text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
                        <span>
                          Correct: {quizStats.most_correct_question.correct}
                        </span>
                        <span>
                          Incorrect: {quizStats.most_correct_question.incorrect}
                        </span>
                        <span>
                          {quizStats.most_correct_question.points} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Statistics Table */}
                  <div className="rounded-lg border border-stroke dark:border-dark-3">
                    <div className="border-b border-stroke p-4 dark:border-dark-3">
                      <h5 className="text-sm font-medium text-dark dark:text-white sm:text-base">
                        Question Performance
                      </h5>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                              Question
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                              Correct
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                              Incorrect
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                              Success Rate
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                              Points
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {quizStats.question_stats.map((stat, index) => {
                            const total = stat.correct + stat.incorrect;
                            const successRate =
                              total > 0 ? (stat.correct / total) * 100 : 0;
                            return (
                              <tr
                                key={stat.question_id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-start">
                                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                                      {index + 1}
                                    </span>
                                    <p className="text-xs text-dark dark:text-white sm:text-sm">
                                      {stat.question_text.length > 50
                                        ? `${stat.question_text.substring(0, 50)}...`
                                        : stat.question_text}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-green-600 dark:text-green-400 sm:text-sm">
                                  {stat.correct}
                                </td>
                                <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 sm:text-sm">
                                  {stat.incorrect}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <div className="mr-2 h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                                      <div
                                        className={`h-2 rounded-full ${
                                          successRate >= 70
                                            ? "bg-green-500"
                                            : successRate >= 50
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                        }`}
                                        style={{ width: `${successRate}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-dark dark:text-white sm:text-sm">
                                      {successRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-primary sm:text-sm">
                                  {stat.points}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
                    No statistics available for this quiz yet.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="mb-4 text-base font-semibold text-dark dark:text-white sm:text-lg">
              Questions
            </h4>

            {isLoadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary sm:h-8 sm:w-8"></div>
                <span className="text-body-color ml-3 text-sm dark:text-dark-6 sm:text-base">
                  Loading questions...
                </span>
              </div>
            ) : questionsError ? (
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
                  <p className="text-sm text-red-800 dark:text-red-200 sm:text-base">
                    {questionsError}
                  </p>
                </div>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
                  No questions found for this quiz.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-stroke p-3 dark:border-dark-3 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex items-center">
                            <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                              {index + 1}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              {question.question_type.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-dark dark:text-white sm:text-base">
                          {question.question_text}
                        </p>
                        {question.correct_answer && (
                          <p className="text-xs text-green-600 dark:text-green-400 sm:text-sm">
                            <span className="font-medium">Correct Answer:</span>{" "}
                            {question.correct_answer}
                          </p>
                        )}
                      </div>
                      <div className="self-start text-right sm:ml-4">
                        <span className="text-xs font-medium text-primary sm:text-sm">
                          {question.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800 sm:max-w-md sm:p-6">
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 sm:h-10 sm:w-10">
                  <svg
                    className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                    Delete Quiz
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300 sm:mb-6 sm:text-base">
                Are you sure you want to delete {selectedQuiz?.title}? This
                will permanently remove the quiz and all associated data.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-0 sm:space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="order-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  disabled={isDeleting}
                  className="order-1 flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 sm:order-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Quiz"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="rounded-[10px] bg-white px-4 pb-4 pt-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-6 lg:px-7.5 lg:pt-7.5">
      <div className="mb-6 flex flex-col gap-4 lg:mb-7.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark dark:text-white sm:text-2xl">
            My Quizzes
          </h3>
          <p className="text-body-color text-sm dark:text-dark-6 sm:text-base">
            Manage and view all your course quizzes
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
          />

          <button
            onClick={fetchQuizzes}
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 sm:text-base"
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
      </div>

      {isLoadingQuizzes ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary sm:h-8 sm:w-8"></div>
          <span className="text-body-color ml-3 text-sm dark:text-dark-6 sm:text-base">
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
            <p className="text-sm text-red-800 dark:text-red-200 sm:text-base">
              {error}
            </p>
          </div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 sm:h-12 sm:w-12"
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
          <h3 className="mt-4 text-base font-medium text-dark dark:text-white sm:text-lg">
            No quizzes found
          </h3>
          <p className="text-body-color mt-2 text-sm dark:text-dark-6 sm:text-base">
            You have not created any quizzes yet.
          </p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 sm:h-12 sm:w-12"
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
          <h3 className="mt-4 text-base font-medium text-dark dark:text-white sm:text-lg">
            No quizzes found
          </h3>
          <p className="text-body-color mt-2 text-sm dark:text-dark-6 sm:text-base">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="hidden min-w-full sm:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm">
                    Quiz
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm">
                    Course
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm">
                    Week
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm md:table-cell">
                    Schedule
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm lg:table-cell">
                    Duration
                  </th>
                  <th className="hidden px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm lg:table-cell">
                    Points
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-4 sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedQuizzes.map((quiz) => {
                  const status = getQuizStatus(quiz);
                  return (
                    <tr
                      key={quiz.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-3 py-4 sm:px-4">
                        <div>
                          <p className="text-sm font-medium text-dark dark:text-white sm:text-base">
                            {quiz.title}
                          </p>
                          <p className="text-body-color text-xs dark:text-dark-6 sm:text-sm">
                            ID: {quiz.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-dark dark:text-white sm:px-4 sm:text-base">
                        {quiz.course_name}
                      </td>
                      <td className="px-3 py-4 text-sm text-dark dark:text-white sm:px-4 sm:text-base">
                        Week {quiz.week_number}
                      </td>
                      <td className="hidden px-3 py-4 sm:px-4 md:table-cell">
                        <div className="text-xs sm:text-sm">
                          <p className="text-dark dark:text-white">
                            {formatDate(quiz.start_date)}
                          </p>
                          <p className="text-body-color dark:text-dark-6">
                            to {formatDate(quiz.end_date)}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-dark dark:text-white sm:px-4 sm:text-base lg:table-cell">
                        {quiz.duration} min
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-dark dark:text-white sm:px-4 sm:text-base lg:table-cell">
                        {quiz.total_points}
                      </td>
                      <td className="px-3 py-4 sm:px-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-4">
                        <button
                          onClick={() => handleViewQuiz(quiz)}
                          className="text-xs font-medium text-primary hover:text-primary/80 sm:text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 sm:hidden">
            {paginatedQuizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              return (
                <div
                  key={quiz.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-dark dark:text-white">
                        {quiz.title}
                      </h4>
                      <p className="text-body-color text-sm dark:text-dark-6">
                        {quiz.course_name}
                      </p>
                      <p className="text-body-color text-xs dark:text-dark-6">
                        ID: {quiz.id}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.status}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Week:
                      </span>
                      <p className="text-dark dark:text-white">
                        Week {quiz.week_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Duration:
                      </span>
                      <p className="text-dark dark:text-white">
                        {quiz.duration} min
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Points:
                      </span>
                      <p className="text-dark dark:text-white">
                        {quiz.total_points}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Ends:
                      </span>
                      <p className="text-dark dark:text-white">
                        {formatDate(quiz.end_date)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewQuiz(quiz)}
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-white sm:px-3 sm:text-sm"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded border px-2 py-1 text-xs sm:px-3 sm:text-sm ${
                      page === currentPage
                        ? "bg-primary text-white"
                        : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-white sm:px-3 sm:text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
