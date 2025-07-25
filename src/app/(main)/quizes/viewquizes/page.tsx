"use client"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { EditQuizForm } from "../editquiz/page"

interface Quiz {
  id: number
  title: string
  course_id: number
  course_name: string
  week_number: number
  start_date: string
  end_date: string
  duration: number
  total_points: number
  created_at: string
  updated_at: string
  questions: Question[]
}

interface Question {
  id: number
  quiz: number
  question_text: string
  question_type: string
  correct_answer: string | null
  points: number
}

type ViewMode = "list" | "detail" | "edit"

export default function ViewQuizPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  // Fetch all quizzes
  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true)
      setError(null)
      const data = await apiFetch("/instructor/quizzes/")
      setQuizzes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes")
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const fetchQuestions = async (quizId: number) => {
    try {
      setIsLoadingQuestions(true)
      setQuestionsError(null)
      const data = await apiFetch(`/quiz/${quizId}/`)
      setQuestions(data.questions || [])
      // Update selected quiz with fresh data
      setSelectedQuiz(data)
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : "Failed to fetch questions")
      setQuestions([])
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleViewQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setViewMode("detail")
    fetchQuestions(quiz.id)
  }

  const handleEditQuiz = () => {
    setViewMode("edit")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedQuiz(null)
    setQuestions([])
    setQuestionsError(null)
    // Refresh the quiz list when returning from edit
    fetchQuizzes()
  }

  const handleBackToDetail = () => {
    setViewMode("detail")
    // Refresh the quiz details when returning from edit
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date()
    const startDate = new Date(quiz.start_date)
    const endDate = new Date(quiz.end_date)

    if (now < startDate) {
      return { status: "upcoming", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
    } else if (now > endDate) {
      return { status: "completed", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
    } else {
      return { status: "active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    }
  }

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return
    if (!confirm(`Are you sure you want to delete "${selectedQuiz.title}"? This action cannot be undone.`)) return

    try {
      setIsLoadingQuestions(true)
      setQuestionsError(null)

      await apiFetch(`/instructor/quizzes/${selectedQuiz.id}/remove/`, {
        method: "DELETE",
      })

      // Go back to list and refresh
      handleBackToList()
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : "Failed to delete quiz")
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  // Edit Mode - Show EditQuizForm
  if (viewMode === "edit" && selectedQuiz) {
    return <EditQuizForm quizId={selectedQuiz.id} onBack={handleBackToDetail} />
  }

  // Detail Mode - Show quiz details
  if (viewMode === "detail" && selectedQuiz) {
    const quizStatus = getQuizStatus(selectedQuiz)

    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="mb-7.5 flex items-center justify-between">
          <div>
            <button onClick={handleBackToList} className="mb-3 flex items-center text-primary hover:text-primary/80">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Quiz List
            </button>
            <h3 className="text-2xl font-bold text-dark dark:text-white">{selectedQuiz.title}</h3>
            <p className="text-body-color dark:text-dark-6">{selectedQuiz.course_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${quizStatus.color}`}>
              {quizStatus.status.charAt(0).toUpperCase() + quizStatus.status.slice(1)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleEditQuiz}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Quiz
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Details */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Week Number</h4>
            <p className="text-lg font-semibold text-dark dark:text-white">Week {selectedQuiz.week_number}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h4>
            <p className="text-lg font-semibold text-dark dark:text-white">{selectedQuiz.duration} min</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</h4>
            <p className="text-lg font-semibold text-dark dark:text-white">{selectedQuiz.total_points}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</h4>
            <p className="text-lg font-semibold text-dark dark:text-white">{questions.length}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-lg font-semibold text-dark dark:text-white">Schedule</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
              <p className="text-dark dark:text-white">{formatDate(selectedQuiz.start_date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date:</span>
              <p className="text-dark dark:text-white">{formatDate(selectedQuiz.end_date)}</p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div>
          <h4 className="mb-4 text-lg font-semibold text-dark dark:text-white">Questions</h4>

          {isLoadingQuestions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-body-color dark:text-dark-6">Loading questions...</span>
            </div>
          ) : questionsError ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
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
                <p className="text-red-800 dark:text-red-200">{questionsError}</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body-color dark:text-dark-6">No questions found for this quiz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                          {index + 1}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {question.question_type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mb-2 text-dark dark:text-white">{question.question_text}</p>
                      {question.correct_answer && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          <span className="font-medium">Correct Answer:</span> {question.correct_answer}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-sm font-medium text-primary">{question.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // List Mode - Show quiz list
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      <div className="mb-7.5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">My Quizzes</h3>
          <p className="text-body-color dark:text-dark-6">Manage and view all your course quizzes</p>
        </div>
        <button
          onClick={fetchQuizzes}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      {isLoadingQuizzes ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-body-color dark:text-dark-6">Loading quizzes...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
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
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12">
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
          <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">No quizzes found</h3>
          <p className="mt-2 text-body-color dark:text-dark-6">You haven't created any quizzes yet.</p>
        </div>
      ) : (
        /* Quiz Table */
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Quiz</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Course</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Week</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Points</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {quizzes.map((quiz) => {
                const status = getQuizStatus(quiz)
                return (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-dark dark:text-white">{quiz.title}</p>
                        <p className="text-sm text-body-color dark:text-dark-6">ID: {quiz.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">{quiz.course_name}</td>
                    <td className="px-4 py-4 text-dark dark:text-white">Week {quiz.week_number}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-dark dark:text-white">{formatDate(quiz.start_date)}</p>
                        <p className="text-body-color dark:text-dark-6">to {formatDate(quiz.end_date)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-dark dark:text-white">{quiz.duration} min</td>
                    <td className="px-4 py-4 text-dark dark:text-white">{quiz.total_points}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                        {status.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewQuiz(quiz)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
