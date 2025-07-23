"use client"

import type React from "react"
import { useState } from "react"
import { QuestionBuilder } from "./question-builder"

interface TestData {
  testName: string
  subject: string
  testType: string
  duration: string
  difficulty: string
  instructions: string
  description: string
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
    testName: "",
    subject: "",
    testType: "",
    duration: "",
    difficulty: "",
    instructions: "",
    description: "",
  })
  const [questions, setQuestions] = useState<Question[]>([])

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

  const handleFinalSubmit = () => {
    const completeTest = {
      ...testData,
      questions,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    }
    console.log("Complete test created:", completeTest)
    // Handle final submission here
  }

  const handleBackToTestDetails = () => {
    setCurrentStep("test-details")
  }

  if (currentStep === "questions") {
    return (
      <QuestionBuilder
        testData={testData}
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onFinalSubmit={handleFinalSubmit}
        onBackToTestDetails={handleBackToTestDetails}
      />
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
        {/* Test Name and Subject Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Test Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter test name"
              value={testData.testName}
              onChange={(e) => handleInputChange("testName", e.target.value)}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Subject <span className="text-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter subject"
              value={testData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        {/* Test Type and Duration Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Test Type <span className="text-red">*</span>
            </label>
            <select
              value={testData.testType}
              onChange={(e) => handleInputChange("testType", e.target.value)}
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            >
              <option value="" disabled>
                Select test type
              </option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="essay">Essay</option>
              <option value="mixed">Mixed Format</option>
              <option value="practical">Practical</option>
              <option value="oral">Oral Examination</option>
            </select>
          </div>
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
        </div>

        {/* Difficulty Level */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Difficulty Level <span className="text-red">*</span>
          </label>
          <select
            value={testData.difficulty}
            onChange={(e) => handleInputChange("difficulty", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          >
            <option value="" disabled>
              Select difficulty level
            </option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">Test Description</label>
          <textarea
            rows={4}
            placeholder="Enter a brief description of the test"
            value={testData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Instructions for Students <span className="text-red">*</span>
          </label>
          <textarea
            rows={6}
            placeholder="Enter detailed instructions for students taking this test"
            value={testData.instructions}
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
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
