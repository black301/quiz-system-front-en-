"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { QuestionBuilder } from "@/components/Forms/question-builder";
import { apiFetch } from "@/lib/api";

interface TestData {
  title: string;
  duration: string;
  startDateTime: string;
  endDateTime: string;
  weekNumber: string;
}

interface Question {
  id: string;
  type: "multiple-choice" | "essay" | "true-false" | "short-answer";
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
}

interface EditQuizFormProps {
  quizId: number;
  onBack: () => void;
}

type FormStep = "test-details" | "questions";

export function EditQuizForm({ quizId, onBack }: EditQuizFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>("test-details");
  const [testData, setTestData] = useState<TestData>({
    title: "",
    duration: "",
    startDateTime: "",
    endDateTime: "",
    weekNumber: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fetchQuizData = useCallback(async () => {
    try {
      setIsLoading(true);
      setSubmitError(null);

      const quizData = await apiFetch(`/quiz/${quizId}/`);

      setTestData({
        title: quizData.title,
        duration: quizData.duration.toString(),
        startDateTime: formatDateForInput(quizData.start_date),
        endDateTime: formatDateForInput(quizData.end_date),
        weekNumber: quizData.week_number.toString(),
      });

      const transformedQuestions = quizData.questions.map(
        (q: any): Question => ({
          id: q.id.toString(),
          type: q.question_type,
          question: q.question_text,
          points: q.points,
          options: q.options || [],
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        }),
      );

      setQuestions(transformedQuestions);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to fetch quiz data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  useEffect(() => {
    if (testData.startDateTime && testData.duration) {
      const startDate = new Date(testData.startDateTime);
      const durationMinutes = Number.parseInt(testData.duration);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000); // Add duration in milliseconds

      const calculatedEndTime = formatDateForInput(endDate.toISOString());
      console.log(
        "[v0] Auto-calculating end time:",
        testData.startDateTime,
        "+",
        durationMinutes,
        "minutes =",
        calculatedEndTime,
      );

      setTestData((prev) => ({
        ...prev,
        endDateTime: calculatedEndTime,
      }));
    }
  }, [testData.startDateTime, testData.duration]);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    // Get local time instead of UTC to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    console.log("[v0] Formatting date:", dateString, "->", formattedDate);
    return formattedDate;
  };

  const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleTestDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(testData.startDateTime);
    const now = new Date();

    if (selectedDate < now) {
      setSubmitError(
        "Start date and time cannot be in the past. Please select today or a future date.",
      );
      return;
    }

    console.log("Test data saved:", testData);
    setCurrentStep("questions");
  };

  const handleInputChange = (field: keyof TestData, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddQuestion = (question: Question) => {
    setQuestions((prev) => [...prev, question]);
  };

  const handleEditQuestion = (
    questionId: string,
    updatedQuestion: Question,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updatedQuestion : q)),
    );
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (questionId.startsWith("new-")) {
      // Just remove from local state if it's a new question
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } else {
      // Delete from server using the specific API endpoint
      try {
        await apiFetch(`/instructor/questions/${questionId}/remove/`, {
          method: "DELETE",
        });
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to delete question",
        );
      }
    }
  };

  const updateQuiz = async (quizData: any) => {
    try {
      const response = await apiFetch(`/instructor/quizzes/${quizId}/edit/`, {
        method: "PATCH",
        body: JSON.stringify(quizData),
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateQuestions = async () => {
    // Handle question updates and deletions using the specific API endpoints
    for (const question of questions) {
      if (question.id.startsWith("new-")) {
        // This is a new question - add it (assuming there's an add endpoint)
        const questionData = {
          question_text: question.question,
          question_type: question.type,
          points: question.points,
          correct_answer: question.correctAnswer || null,
          options: question.options,
          explanation: question.explanation,
        };

        await apiFetch(`/instructor/quizzes/${quizId}/questions/create/`, {
          method: "POST",
          body: JSON.stringify(questionData),
        });
      } else {
        // This is an existing question - update it using the specific API
        const questionData = {
          question_text: question.question,
          points: question.points,
        };

        await apiFetch(`/instructor/questions/${question.id}/edit/`, {
          method: "PATCH",
          body: JSON.stringify(questionData),
        });
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (questions.length === 0) {
      setSubmitError("Please add at least one question to the quiz.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("[v0] Original start time:", testData.startDateTime);
      console.log("[v0] Original end time:", testData.endDateTime);

      const startDate = new Date(testData.startDateTime);
      const endDate = new Date(testData.endDateTime);

      console.log("[v0] Parsed start date:", startDate);
      console.log("[v0] Parsed end date:", endDate);
      console.log("[v0] Start ISO:", startDate.toISOString());
      console.log("[v0] End ISO:", endDate.toISOString());

      // Transform the data to match API format
      const quizData = {
        title: testData.title,
        week_number: Number.parseInt(testData.weekNumber),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        duration: Number.parseInt(testData.duration),
        total_points: questions.reduce((sum, q) => sum + q.points, 0),
      };

      console.log("[v0] Updating quiz data:", quizData);
      const response = await updateQuiz(quizData);

      // Handle questions separately
      await updateQuestions();

      console.log("Quiz updated successfully:", response);
      setSubmitSuccess(true);

      // Go back after successful submission
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Error updating quiz:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to update quiz. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteQuiz = async () => {
    try {
      const response = await apiFetch(`/instructor/quizzes/${quizId}/remove/`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteQuiz = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await deleteQuiz();
        console.log("Quiz deleted successfully");
        onBack(); // Go back to quiz list
      } catch (error) {
        console.error("Error deleting quiz:", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to delete quiz. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackToTestDetails = () => {
    setCurrentStep("test-details");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading quiz data...
          </span>
        </div>
      </div>
    );
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">
            Quiz Updated Successfully!
          </h3>
          <p className="text-body-color text-center dark:text-dark-6">
            Your quiz &quot;{testData.title}&quot; has been updated
            successfully.
          </p>
        </div>
      </div>
    );
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
          <div className="mt-4 rounded-[7px] border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
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
              <p className="text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex items-center space-x-3 rounded-lg bg-white p-6 dark:bg-gray-dark">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="text-dark dark:text-white">
                Updating quiz...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header with Back Button */}
      <div className="mb-7.5">
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              Edit Quiz
            </h3>
            <p className="text-body-color dark:text-dark-6">
              Update the quiz details below
            </p>
          </div>
          {/* Delete Quiz Button */}
          <button
            onClick={handleDeleteQuiz}
            className="flex items-center rounded-[7px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            disabled={isSubmitting}
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
            Delete Quiz
          </button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-4 rounded-[7px] border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
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
            <p className="text-red-800 dark:text-red-200">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleTestDataSubmit}>
        {/* Test Name */}
        <div className="mb-6">
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

        {/* Test Details Grid - matching view page layout */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:gap-4">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
            <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Week Number <span className="text-red">*</span>
            </h4>
            <input
              type="number"
              placeholder="Week"
              value={testData.weekNumber}
              onChange={(e) => handleInputChange("weekNumber", e.target.value)}
              min="1"
              required
              className="w-full border-0 bg-transparent p-0 text-base font-semibold text-dark outline-none dark:text-white sm:text-lg"
            />
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4">
            <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Duration (minutes) <span className="text-red">*</span>
            </h4>
            <input
              type="number"
              placeholder="Minutes"
              value={testData.duration}
              onChange={(e) => {
                const value = e.target.value;
                // Prevent entering values greater than 120
                if (
                  value === "" ||
                  (Number(value) >= 1 && Number(value) <= 120)
                ) {
                  handleInputChange("duration", value);
                }
              }}
              min="1"
              max="120"
              required
              className="w-full border-0 bg-transparent p-0 text-base font-semibold text-dark outline-none dark:text-white sm:text-lg"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum 120 minutes
            </p>
          </div>
          <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:p-4 md:col-span-2">
            <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              Total Points
            </h4>
            <p className="text-base font-semibold text-dark dark:text-white sm:text-lg">
              {questions.reduce((sum, q) => sum + q.points, 0)} pts
            </p>
          </div>
        </div>

        {/* Schedule Section - matching view page layout */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-base font-semibold text-dark dark:text-white sm:text-lg">
            Schedule
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                Start Date & Time <span className="text-red">*</span>
              </label>
              <input
                type="datetime-local"
                value={testData.startDateTime}
                onChange={(e) =>
                  handleInputChange("startDateTime", e.target.value)
                }
                min={getTodayDateTime()}
                required
                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary sm:text-base"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be today or later
              </p>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                End Date & Time (Auto-calculated)
              </label>
              <div className="w-full rounded-[7px] border-[1.5px] border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-base">
                {testData.endDateTime
                  ? new Date(testData.endDateTime).toLocaleString()
                  : "Set start time and duration"}
              </div>
            </div>
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
  );
}
