"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface CreateStudentFormProps {
  onBack: () => void;
}

interface StudentFormData {
  name: string;
  email: string;
  password: string;
  level: number;
  courses: number[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  level: number;
}

export function CreateStudentForm({ onBack }: CreateStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    password: "",
    level: 1,
    courses: [],
  });
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await apiFetch("/instructor/courses/");
        setAvailableCourses(courses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Failed to load courses. Please refresh the page.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (
    field: keyof StudentFormData,
    value: string | number | number[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCourseToggle = (courseId: number) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const getEligibleCourses = () => {
    return availableCourses.filter((course) => course.level <= formData.level);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.courses.length === 0) {
      setError("You must select at least one course for the student.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch("/instructor/create-student/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      console.log("Student created successfully:", response);
      setSuccess(true);

      // Go back after successful creation
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create student. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      case 4:
        return "Expert";
      default:
        return "Unknown";
    }
  };

  // Success message component
  if (success) {
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
            Student Created Successfully!
          </h3>
          <p className="text-body-color text-center dark:text-dark-6">
            Student &quot;{formData.name}&quot; has been created and enrolled in{" "}
            {formData.courses.length} course(s).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
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
          Back to Student List
        </button>
        <h3 className="text-2xl font-bold text-dark dark:text-white">
          Create New Student
        </h3>
        <p className="text-body-color dark:text-dark-6">
          Add a new student and enroll them in your courses
        </p>
      </div>

      {/* Error Message */}
      {error && (
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
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Student Name */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Student Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter student's full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Email Address */}
        <div className="mb-4.5">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Email Address <span className="text-red">*</span>
          </label>
          <input
            type="email"
            placeholder="Enter student's email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Password and Level Row */}
        <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Password <span className="text-red">*</span>
            </label>
            <input
              type="password"
              placeholder="Enter student's password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              minLength={6}
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="w-full xl:w-1/2">
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Level <span className="text-red">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) =>
                handleInputChange("level", Number.parseInt(e.target.value))
              }
              required
              className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            >
              <option value={1}>Level 1 - Beginner</option>
              <option value={2}>Level 2 - Intermediate</option>
              <option value={3}>Level 3 - Advanced</option>
              <option value={4}>Level 4 - Expert</option>
            </select>
          </div>
        </div>

        {/* Level Description */}
        <div className="mb-6 rounded-[7px] bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 text-sm font-medium text-dark dark:text-white">
            Selected Level: {getLevelName(formData.level)}
          </h4>
          <p className="text-body-color text-xs dark:text-dark-6">
            {formData.level === 1 &&
              "Suitable for students who are new to the subject matter."}
            {formData.level === 2 &&
              "For students with basic understanding and some experience."}
            {formData.level === 3 &&
              "For students with solid foundation and good comprehension."}
            {formData.level === 4 &&
              "For students with extensive knowledge and expertise."}
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Select Courses <span className="text-red">*</span>
          </label>

          {loadingCourses ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="text-body-color ml-2 dark:text-dark-6">
                Loading courses...
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {getEligibleCourses().length === 0 ? (
                <div className="rounded-[7px] border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    No courses available for Level {formData.level} students.
                    Please select a different level or contact support.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-body-color mb-3 text-xs dark:text-dark-6">
                    Showing courses suitable for Level {formData.level} students
                    ({getEligibleCourses().length} available)
                  </p>
                  {getEligibleCourses().map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-3 rounded-[7px] border border-stroke p-4 dark:border-dark-3"
                    >
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={formData.courses.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-dark dark:text-white">
                              {course.name}
                            </h4>
                            <p className="text-body-color text-sm dark:text-dark-6">
                              {course.code}
                            </p>
                          </div>
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                            Level {course.level}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {formData.courses.length > 0 && (
            <div className="text-body-color mt-3 text-sm dark:text-dark-6">
              Selected {formData.courses.length} course(s)
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isSubmitting || loadingCourses || getEligibleCourses().length === 0
          }
          className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating Student..." : "Create Student"}
        </button>
      </form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex items-center space-x-3 rounded-lg bg-white p-6 dark:bg-gray-dark">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="text-dark dark:text-white">
              Creating student...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
