"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { QuestionBuilder } from "@/components/Forms/question-builder"
import { apiFetch } from "@/lib/api"

interface TestData {
  title: string
  duration: string
  startDateTime: string
  endDateTime: string
  weekNumber: string
}

interface Question {
  id: string
  type: "multiple-choice" | "essay" | "true-false" | "short-answer"
  question: string
  points: number
  options?: string[]
  correctAnswer?: string | number
  explanation?: string
}

interface EditQuizFormProps {
  quizId: number
  onBack: () => void
}

type FormStep = "test-details" | "questions"

export function EditQuizForm({ quizId, onBack }: EditQuizFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("test-details")
  const [testData, setTestData] = useState<TestData>({
    title: "",
    duration: "",
    startDateTime: "",
    endDateTime: "",
    weekNumber: "",
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch existing quiz data on mount
  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      setIsLoading(true)
      setSubmitError(null)

      // Fetch quiz details with questions
      const quizData = await apiFetch(`/quiz/${quizId}/`)

      // Populate form with existing data
      setTestData({
        title: quizData.title,
        duration: quizData.duration.toString(),
        startDateTime: formatDateForInput(quizData.start_date),
        endDateTime: formatDateForInput(quizData.end_date),
        weekNumber: quizData.week_number.toString(),
      })

      // Transform questions to match our interface
      const transformedQuestions = quizData.questions.map((q: any, index: number) => ({
        id: q.id.toString(),
        type: q.question_type as "multiple-choice" | "essay" | "true-false" | "short-answer",
        question: q.question_text,
        points: q.points,
        options: q.options || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }))

      setQuestions(transformedQuestions)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to fetch quiz data")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const handleTestDataSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Test data saved:", testData)
    setCurrentStep("questions")
  }

  const handleInputChange = (field: keyof TestData, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddQuestion = (question: Question) => {
    setQuestions((prev) => [...prev, question])
  }

  const handleEditQuestion = (questionId: string, updatedQuestion: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? updatedQuestion : q)))
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const updateQuiz = async (quizData: any) => {
    try {
      const response = await apiFetch(`/instructor/quizzes/${quizId}/edit/`, {
        method: "PATCH",
        body: JSON.stringify(quizData),
      })
      return response
    } catch (error) {
      throw error
    }
  }

  const handleFinalSubmit = async () => {
    if (questions.length === 0) {
      setSubmitError("Please add at least one question to the quiz.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Transform the data to match API format
      const quizData = {
        title: testData.title,
        week_number: Number.parseInt(testData.weekNumber),
        start_date: new Date(testData.startDateTime).toISOString(),
        end_date: new Date(testData.endDateTime).toISOString(),
        duration: Number.parseInt(testData.duration),
        total_points: questions.reduce((sum, q) => sum + q.points, 0),
      }

      console.log("Updating quiz data:", quizData)
      const response = await updateQuiz(quizData)

      // Handle questions separately
      await updateQuestions()

      console.log("Quiz updated successfully:", response)
      setSubmitSuccess(true)

      // Go back after successful submission
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (error) {
      console.error("Error updating quiz:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to update quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateQuestions = async () => {
    // This is a simplified approach - in a real app, you'd want to:
    // 1. Compare existing questions with new ones
    // 2. Update changed questions using PATCH /instructor/questions/<id>/edit/
    // 3. Delete removed questions using DELETE /instructor/questions/<id>/remove/
    // 4. Add new questions using POST

    for (const question of questions) {
      if (question.id.startsWith("new-")) {
        // This is a new question - add it
        const questionData = {
          question_text: question.question,
          question_type: question.type,
          points: question.points,
          correct_answer: question.correctAnswer || null,
          options: question.options,
          explanation: question.explanation,
        }

        await apiFetch(`/instructor/quizzes/${quizId}/questions/`, {
          method: "POST",
          body: JSON.stringify(questionData),
        })
      } else {
        // This is an existing question - update it
        const questionData = {
          question_text: question.question,
          points: question.points,
        }

        await apiFetch(`/instructor/questions/${question.id}/edit/`, {
          method: "PATCH",
          body: JSON.stringify(questionData),
        })
      }
    }
  }

  const handleBackToTestDetails = () => {
    setCurrentStep("test-details")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-body-color dark:text-dark-6">Loading quiz data...</span>
        </div>
      </div>
    )
  }

  // Success message component
  if (submitSuccess) {
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
          <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">Quiz Updated Successfully!</h3>
          <p className="text-center text-body-color dark:text-dark-6">
            Your quiz "{testData.title}" has been updated successfully.
          </p>
        </div>
      </div>
    )
  }

  if (currentStep === "questions") {
    return (
      <div>
        <QuestionBuilder
          testData={testData}
          questions={questions}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onFinalSubmit={handleFinalSubmit}
          onBackToTestDetails={handleBackToTestDetails}
          isEditing={true}
        />

        {/* Error Message */}
        {submitError && (
          <div className="mt-4 rounded-[7px] bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
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
              <p className="text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-dark dark:text-white">Updating quiz...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with Back Button */}
      <div className="mb-7.5">
        <button onClick={onBack} className="mb-3 flex items-center text-primary hover:text-primary/80">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quiz List
        </button>
        <h3 className="text-2xl font-bold text-dark dark:text-white">Edit Quiz</h3>
        <p className="text-body-color dark:text-dark-6">Update the quiz details below</p>
      </div>

      {/* Error Message */}
      {submitError && (
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
            <p className="text-red-800 dark:text-red-200">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleTestDataSubmit}>
        {/* Test Name Row */}
        <div className="mb-4.5">
          <div className="w-full">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Test Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter test name"
              value={testData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        {/* Duration and Week Number Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Duration (minutes) <span className="text-red">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter duration in minutes"
              value={testData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              min="1"
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Week Number <span className="text-red">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter week number"
              value={testData.weekNumber}
              onChange={(e) => handleInputChange("weekNumber", e.target.value)}
              min="1"
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        {/* Start Date and Time Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Start Date & Time <span className="text-red">*</span>
            </label>
            <input
              type="datetime-local"
              value={testData.startDateTime}
              onChange={(e) => handleInputChange("startDateTime", e.target.value)}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              End Date & Time <span className="text-red">*</span>
            </label>
            <input
              type="datetime-local"
              value={testData.endDateTime}
              onChange={(e) => handleInputChange("endDateTime", e.target.value)}
              required
              min={testData.startDateTime}
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
        >
          Continue to Edit Questions
        </button>
      </form>
    </div>
  )
}
