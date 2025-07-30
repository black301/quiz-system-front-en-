"use client";

import { useState, useEffect } from "react";

interface Answer {
  id: number;
  question: number;
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

interface SubmissionGradingFormProps {
  submission: Submission;
  questions: Question[];
  onGradeAllAnswers: (
    gradedAnswers: Array<{
      answer_id: number;
      points: number;
      feedback: string;
    }>,
  ) => Promise<void>;
  onEditSingleAnswer: (
    answerId: number,
    points: number,
    feedback: string,
  ) => Promise<void>;
  onEditOverallFeedback: (feedback: string) => Promise<void>;
  isSaving: boolean;
}

interface GradingData {
  [answerId: number]: {
    points: number;
    feedback: string;
  };
}

export function SubmissionGradingForm({
  submission,
  questions,
  onGradeAllAnswers,
  onEditSingleAnswer,
  onEditOverallFeedback,
  isSaving,
}: SubmissionGradingFormProps) {
  const [gradingData, setGradingData] = useState<GradingData>({});
  const [overallFeedback, setOverallFeedback] = useState(
    submission.feedback || "",
  );
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);

  // Initialize grading data from existing answers
  useEffect(() => {
    const initialData: GradingData = {};
    submission.answers.forEach((answer) => {
      initialData[answer.id] = {
        points: answer.points || 0,
        feedback: answer.feedback || "",
      };
    });
    setGradingData(initialData);
  }, [submission.answers]);

  const handlePointsChange = (answerId: number, points: number) => {
    setGradingData((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        points: Math.max(0, points),
      },
    }));
  };

  const handleFeedbackChange = (answerId: number, feedback: string) => {
    setGradingData((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        feedback,
      },
    }));
  };

  const handleGradeAll = async () => {
    const gradedAnswers = submission.answers.map((answer) => ({
      answer_id: answer.id,
      points: gradingData[answer.id]?.points || 0,
      feedback: gradingData[answer.id]?.feedback || "",
    }));

    await onGradeAllAnswers(gradedAnswers);
  };

  const handleEditSingle = async (answerId: number) => {
    const data = gradingData[answerId];
    if (data) {
      await onEditSingleAnswer(answerId, data.points, data.feedback);
      setEditingAnswer(null);
    }
  };

  const handleUpdateOverallFeedback = async () => {
    await onEditOverallFeedback(overallFeedback);
  };

  const getQuestionForAnswer = (questionId: number) => {
    return questions.find((q) => q.id === questionId);
  };

  const isCorrectAnswer = (answer: Answer, question: Question) => {
    if (!question.correct_answer) return null;

    if (question.question_type === "multiple-choice") {
      const selectedIndex = Number.parseInt(answer.answer_text);
      return selectedIndex === Number.parseInt(question.correct_answer);
    }

    return (
      answer.answer_text.toLowerCase().trim() ===
      question.correct_answer.toLowerCase().trim()
    );
  };

  const getAnswerDisplay = (answer: Answer, question: Question) => {
    if (question.question_type === "multiple-choice" && question.options) {
      const selectedIndex = Number.parseInt(answer.answer_text);
      return question.options[selectedIndex] || answer.answer_text;
    }
    return answer.answer_text;
  };

  const totalCurrentPoints = Object.values(gradingData).reduce(
    (sum, data) => sum + data.points,
    0,
  );
  const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
  return (
    <div className="space-y-6">
      {/* Questions and Answers */}
      <div className="space-y-4">
        {submission.answers.map((answer, index) => {
          const question = getQuestionForAnswer(answer.question);
          if (!question) return null;

          const isCorrect = isCorrectAnswer(answer, question);
          const isEditing = editingAnswer === answer.id;

          return (
            <div
              key={answer.id}
              className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card"
            >
              <div className="mb-4">
                <div className="mb-2 flex items-start justify-between">
                  <h5 className="font-medium text-dark dark:text-white">
                    Question {index + 1} ({question.points} points)
                  </h5>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      question.question_type === "multiple-choice" ||
                      question.question_type === "true-false"
                        ? isCorrect === true
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : isCorrect === false
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {question.question_type.replace("-", " ")}
                  </span>
                </div>
                <p className="mb-3 text-dark dark:text-white">
                  {question.question_text}
                </p>

                {question.correct_answer && (
                  <div className="mb-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Correct Answer: {question.correct_answer}
                    </p>
                    {question.explanation && (
                      <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student&apos;s Answer:
                  </p>
                  <p className="text-dark dark:text-white">
                    {getAnswerDisplay(answer, question)}
                  </p>
                </div>
              </div>

              <div className="border-t border-stroke pt-4 dark:border-dark-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Points (Max: {question.points})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={question.points}
                      value={gradingData[answer.id]?.points || 0}
                      onChange={(e) =>
                        handlePointsChange(
                          answer.id,
                          Number.parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-3 py-2 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Feedback
                    </label>
                    <textarea
                      rows={2}
                      value={gradingData[answer.id]?.feedback || ""}
                      onChange={(e) =>
                        handleFeedbackChange(answer.id, e.target.value)
                      }
                      placeholder="Provide feedback for this answer..."
                      className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-3 py-2 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleEditSingle(answer.id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Update This Answer
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Feedback */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Overall Feedback
        </h4>
        <div className="space-y-3">
          <textarea
            rows={4}
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            placeholder="Provide overall feedback for the student's performance..."
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-3 py-2 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          <div className="flex justify-end">
            <button
              onClick={handleUpdateOverallFeedback}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Update Overall Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Grade Summary - Moved to Bottom */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-dark dark:text-white">
            Grade Summary
          </h4>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {totalCurrentPoints}/{totalPossiblePoints} points
            </div>
            <div className="text-body-color text-sm dark:text-dark-6">
              {totalPossiblePoints > 0
                ? Math.round((totalCurrentPoints / totalPossiblePoints) * 100)
                : 0}
              %
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGradeAll}
            disabled={isSaving}
            className="flex-1 rounded-[7px] bg-primary p-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save All Grades"}
          </button>
        </div>
      </div>
    </div>
  );
}
