"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { SubmissionGradingForm } from "./submission-grading-form";

interface Answer {
  id: number;
  question_id: number;
  question_text: string;
  answer_text: string;
  points: number | null;
  feedback: string | null;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string | null;
  options?: string[];
  explanation?: string;
}

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
  answers: Answer[];
}

interface GradeSubmissionPageProps {
  submissionId: number;
  onBack: () => void;
}

export function GradeSubmissionPage({
  submissionId,
  onBack,
}: GradeSubmissionPageProps) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingRecording, setIsLoadingRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const fetchSubmissionData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const submissionData = await apiFetch(
        `/instructor/submissions/${submissionId}/`,
      );
      setSubmission(submissionData);
      const quizData = await apiFetch(`/quiz/${submissionData.quiz}/`);
      setQuestions(quizData.questions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch submission data",
      );
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmissionData();
  }, [fetchSubmissionData]);

  const handleShowRecording = async () => {
    if (!submission) return;

    try {
      setIsLoadingRecording(true);
      setRecordingError(null);

      const response = await apiFetch(
        `/quiz/${submission.quiz}/student/${submission.student}/recording/`,
      );

      if (response.status === "success" && response.video_url) {
        // Open the video in a new tab
        window.open(response.video_url, "_blank");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("No recording found")) {
        setRecordingError("No recording found for this submission");
      } else {
        setRecordingError(
          err instanceof Error ? err.message : "Failed to load recording",
        );
      }
      // Clear error after 5 seconds
      setTimeout(() => setRecordingError(null), 5000);
    } finally {
      setIsLoadingRecording(false);
    }
  };

  const handleGradeAllAnswers = async (
    gradedAnswers: Array<{
      answer_id: number;
      points: number;
      feedback: string;
    }>,
  ) => {
    try {
      setIsSaving(true);
      setError(null);

      await apiFetch(`/instructor/submissions/${submissionId}/grade/`, {
        method: "PATCH",
        body: JSON.stringify({ answers: gradedAnswers }),
      });

      setSuccessMessage("All answers graded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh submission data
      await fetchSubmissionData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grade answers");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditOverallFeedback = async (feedback: string) => {
    try {
      setError(null);

      await apiFetch(`/instructor/submissions/${submissionId}/edit-feedback/`, {
        method: "PATCH",
        body: JSON.stringify({ feedback }),
      });
      // Refresh submission data
      await fetchSubmissionData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update feedback",
      );
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

  const calculateTotalGrade = () => {
    if (!submission) return 0;
    return submission.answers.reduce(
      (total, answer) => total + (answer.points || 0),
      0,
    );
  };

  const getTotalPossiblePoints = () => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading submission...
          </span>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="py-12 text-center">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <svg
              className="mx-auto h-12 w-12"
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
          </div>
          <h3 className="mb-2 text-lg font-medium text-dark dark:text-white">
            Error Loading Submission
          </h3>
          <p className="text-body-color mb-4 dark:text-dark-6">{error}</p>
          <button
            onClick={onBack}
            className="text-primary hover:text-primary/80"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!submission) return null;

  const totalGrade = calculateTotalGrade();
  const totalPossible = getTotalPossiblePoints();
  const percentage =
    totalPossible > 0 ? Math.round((totalGrade / totalPossible) * 100) : 0;

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
              Back to Submissions
            </button>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              Grade Submission - {submission.student_name}
            </h3>
            <p className="text-body-color dark:text-dark-6">
              Submitted on {formatDate(submission.submission_date)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {totalGrade}/{totalPossible} ({percentage}%)
            </div>
            <div className="text-body-color text-sm dark:text-dark-6">
              Status:{" "}
              {submission.status.charAt(0).toUpperCase() +
                submission.status.slice(1)}
            </div>
            <button
              onClick={handleShowRecording}
              disabled={isLoadingRecording}
              className="mt-3 flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingRecording ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  Show Recording
                </>
              )}
            </button>
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

        {recordingError && (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400"
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
              <p className="text-orange-800 dark:text-orange-200">
                {recordingError}
              </p>
            </div>
          </div>
        )}

        {/* Student Info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Student
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              {submission.student_name}
            </p>
            <p className="text-body-color text-sm dark:text-dark-6">
              ID: {submission.student}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Submission Date
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              {formatDate(submission.submission_date)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Questions
            </h4>
            <p className="text-lg font-semibold text-dark dark:text-white">
              {submission.answers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Grading Form */}
      <SubmissionGradingForm
        submission={submission}
        questions={questions}
        onGradeAllAnswers={handleGradeAllAnswers}
        onEditOverallFeedback={handleEditOverallFeedback}
        isSaving={isSaving}
      />

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex items-center space-x-3 rounded-lg bg-white p-6 dark:bg-gray-dark">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="text-dark dark:text-white">Saving grades...</span>
          </div>
        </div>
      )}
    </div>
  );
}
