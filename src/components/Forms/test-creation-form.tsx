"use client"

import type React from "react"
import { useState } from "react"
import { QuestionBuilder } from "./question-builder"
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

type FormStep = "test-details" | "questions"

export function TestCreationForm() {
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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const createQuiz = async (quizData: any) => {
    try {
      const response = await apiFetch("/instructor/quizzes/", {
        method: "POST",
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
        questions: questions.map((q) => ({
          question_text: q.question,
          points: q.points,
          type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        })),
      }

      console.log("Submitting quiz data:", quizData)
      const response = await createQuiz(quizData)

      console.log("Quiz created successfully:", response)
      setSubmitSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setTestData({
          title: "",
          duration: "",
          startDateTime: "",
          endDateTime: "",
          weekNumber: "",
        })
        setQuestions([])
        setCurrentStep("test-details")
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error creating quiz:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to create quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToTestDetails = () => {
    setCurrentStep("test-details")
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
          <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">Quiz Created Successfully!</h3>
          <p className="text-center text-body-color dark:text-dark-6">
            Your quiz &quot;{testData.title}&quot; has been created and is ready for students.
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
              <span className="text-dark dark:text-white">Creating quiz...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-7.5">
        <h3 className="text-2xl font-bold text-dark dark:text-white">Create New Test</h3>
        <p className="text-body-color dark:text-dark-6">
          Fill out the form below to create a new test for your students
        </p>
      </div>

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
          Continue to Add Questions
        </button>
      </form>
    </div>
  )
}
