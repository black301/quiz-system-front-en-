"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestData {
  title: string;
  duration: string;
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

interface QuestionBuilderProps {
  testData: TestData;
  questions: Question[];
  onAddQuestion: (question: Question) => void;
  onEditQuestion: (questionId: string, question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onFinalSubmit: () => void;
  onBackToTestDetails: () => void;
  isEditing?: boolean; // New prop to indicate if we're in edit mode
}

export function QuestionBuilder({
  testData,
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onFinalSubmit,
  onBackToTestDetails,
  isEditing = false,
}: QuestionBuilderProps) {
  const router = useRouter();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: "short-answer",
    question: "",
    points: 1,
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.question || !currentQuestion.points) return;

    const questionToSave: Question = {
      id: editingQuestion?.id || `new-${Date.now()}`, // Use "new-" prefix for new questions in edit mode
      type: currentQuestion.type as Question["type"],
      question: currentQuestion.question,
      points: currentQuestion.points,
      options:
        currentQuestion.type === "multiple-choice"
          ? currentQuestion.options
          : undefined,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
    };

    if (editingQuestion) {
      onEditQuestion(editingQuestion.id, questionToSave);
      setEditingQuestion(null);
    } else {
      onAddQuestion(questionToSave);
    }

    // Reset form
    setCurrentQuestion({
      type: "short-answer",
      question: "",
      points: 1,
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
    setShowQuestionForm(false);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({
      ...question,
      options: question.options || ["", "", "", ""],
    });
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      onDeleteQuestion(questionId);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ["", "", "", ""])];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleCancelForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setCurrentQuestion({
      type: "short-answer",
      question: "",
      points: 1,
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Test Summary */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-dark dark:text-white">
              {testData.title}
            </h3>
            <p className="text-body-color dark:text-dark-6">
              {testData.duration} minutes • {questions.length} questions •{" "}
              {totalPoints} points
            </p>
          </div>
          <button
            onClick={onBackToTestDetails}
            className="rounded-[7px] border border-stroke px-4 py-2 text-body-sm font-medium text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Edit Test Details
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-dark dark:text-white">
            Questions
          </h4>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="rounded-[7px] bg-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-opacity-90"
          >
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-body-color dark:text-dark-6">
              No questions added yet. Click &quot;Add Question&quot; to get
              started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-[7px] border border-stroke p-4 dark:border-dark-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-body-sm font-medium text-primary">
                        Q{index + 1}
                      </span>
                      <span className="rounded bg-gray-1 px-2 py-1 text-xs font-medium text-dark dark:bg-dark-2 dark:text-white">
                        {question.type.replace("-", " ")}
                      </span>
                      <span className="text-body-color text-body-sm dark:text-dark-6">
                        {question.points}{" "}
                        {question.points === 1 ? "point" : "points"}
                      </span>
                      {/* Show indicator for new questions in edit mode */}
                      {isEditing && question.id.startsWith("new-") && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-dark dark:text-white">
                      {question.question}
                    </p>
                    {question.options && (
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2"
                          >
                            <span className="text-body-color text-body-sm dark:text-dark-6">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span
                              className={`text-body-sm ${
                                question.correctAnswer === optIndex
                                  ? "font-medium text-green-600 dark:text-green-400"
                                  : "text-body-color dark:text-dark-6"
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Show correct answer for non-multiple choice questions */}
                    {question.type !== "multiple-choice" &&
                      question.correctAnswer && (
                        <div className="mt-2">
                          <span className="text-body-sm font-medium text-green-600 dark:text-green-400">
                            Expected Answer: {question.correctAnswer}
                          </span>
                        </div>
                      )}
                    {/* Show explanation if available */}
                    {question.explanation && (
                      <div className="mt-2">
                        <span className="text-body-color text-body-sm dark:text-dark-6">
                          <strong>Explanation:</strong> {question.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="rounded px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded px-3 py-1 text-xs font-medium text-red hover:bg-red hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onFinalSubmit}
              className="rounded-[7px] bg-green-600 px-6 py-3 font-medium text-white hover:bg-opacity-90"
            >
              {isEditing ? "Update" : "Create"} Test ({questions.length}{" "}
              questions, {totalPoints} points)
            </button>
          </div>
        )}
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-xl font-semibold text-dark dark:text-white">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h4>
              <button
                onClick={handleCancelForm}
                className="text-body-color hover:text-dark dark:text-dark-6 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuestionSubmit}>
              {/* Question Type and Points */}
              <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                <div className="w-full xl:w-2/3">
                  <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                    Question Type <span className="text-red">*</span>
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        type: e.target.value as Question["type"],
                        options:
                          e.target.value === "multiple-choice"
                            ? ["", "", "", ""]
                            : undefined,
                        correctAnswer: "", // Reset correct answer when type changes
                      }))
                    }
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  >
                    {/* <option value="multiple-choice">Multiple Choice</option> */}
                    {/* <option value="essay">Essay</option> */}
                    {/* <option value="true-false">True/False</option> */}
                    <option value="short-answer">Short Answer</option>
                  </select>
                </div>
                <div className="w-full xl:w-1/3">
                  <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                    Points <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentQuestion.points || ""}
                    onChange={(e) =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        points: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4.5">
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Question <span className="text-red">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter your question"
                  value={currentQuestion.question || ""}
                  onChange={(e) =>
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>

              {/* Multiple Choice Options */}
              {currentQuestion.type === "multiple-choice" && (
                <div className="mb-4.5">
                  <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                    Answer Options <span className="text-red">*</span>
                  </label>
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={currentQuestion.correctAnswer === index}
                          onChange={(e) =>
                            setCurrentQuestion((prev) => ({
                              ...prev,
                              correctAnswer: Number.parseInt(e.target.value),
                            }))
                          }
                          className="h-4 w-4 text-primary"
                        />
                        <span className="text-body-sm font-medium text-dark dark:text-white">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          required
                          className="flex-1 rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* True/False Options */}
              {currentQuestion.type === "true-false" && (
                <div className="mb-4.5">
                  <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                    Correct Answer <span className="text-red">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="trueFalseAnswer"
                        value="true"
                        checked={currentQuestion.correctAnswer === "true"}
                        onChange={(e) =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            correctAnswer: e.target.value,
                          }))
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-body-sm text-dark dark:text-white">
                        True
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="trueFalseAnswer"
                        value="false"
                        checked={currentQuestion.correctAnswer === "false"}
                        onChange={(e) =>
                          setCurrentQuestion((prev) => ({
                            ...prev,
                            correctAnswer: e.target.value,
                          }))
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-body-sm text-dark dark:text-white">
                        False
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 rounded-[7px] border border-stroke px-4 py-3 font-medium text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-[7px] bg-primary px-4 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  {editingQuestion ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
