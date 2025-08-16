"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { METHODS } from "node:http";

interface Course {
  id: number;
  name: string;
  code: string;
  level: number;
}

interface Student {
  id: number;
  email: string;
  name: string;
  level: number;
}

interface StudentProgress {
  student_id: number;
  student_name: string;
  completed_quizzes: number;
  pending_quizzes: number;
}

interface StudentProgressResponse {
  course_id: number;
  course_name: string;
  student_progress: StudentProgress[];
}
interface StudentProgressApiResponse {
  results: StudentProgressResponse[];
}
type ViewMode = "list" | "detail";

export default function CourseManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setError(null);
      const data = await apiFetch("/instructor/courses/");
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCourseStudents = async (courseId: number) => {
    try {
      setIsLoadingStudents(true);
      setStudentsError(null);
      const data = await apiFetch(`/instructor/courses/${courseId}/students/`);
      setCourseStudents(data);
    } catch (err) {
      setStudentsError(
        err instanceof Error ? err.message : "Failed to fetch course students",
      );
      setCourseStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };
  const fetchStudentProgress = async () => {
    try {
      setIsLoadingProgress(true);
      setProgressError(null);

      const data: StudentProgressApiResponse = await apiFetch(
        "/instructor/statistics/student-progress/",
      );
      // grab the first course (if only one is expected)
      const firstCourse = data.results[0];
      setStudentProgress(firstCourse?.student_progress || []);
    } catch (err) {
      setProgressError(
        err instanceof Error ? err.message : "Failed to fetch student progress",
      );
      setStudentProgress([]);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const getStudentProgress = (studentId: number) => {
    if (!studentProgress || !Array.isArray(studentProgress)) {
      return undefined;
    }
    return studentProgress.find(
      (progress) => progress.student_id === studentId,
    );
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewMode("detail");
    fetchCourseStudents(course.id);
    fetchStudentProgress();
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCourse(null);
    setCourseStudents([]);
    setStudentsError(null);
    setStudentProgress([]);
    setProgressError(null);
  };

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 4:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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

  if (viewMode === "detail" && selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="mb-7.5 flex items-center justify-between">
            <div>
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
                Back to Course List
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-dark dark:text-white">
                    {selectedCourse.name}
                  </h3>
                  <p className="text-body-color dark:text-dark-6">
                    Course Code: {selectedCourse.code}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getLevelBadgeColor(selectedCourse.level)}`}
              >
                {selectedCourse.level} - {getLevelName(selectedCourse.level)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Course ID
              </h4>
              <p className="text-lg font-semibold text-dark dark:text-white">
                #{selectedCourse.id}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Course Code
              </h4>
              <p className="text-lg font-semibold text-dark dark:text-white">
                {selectedCourse.code}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Enrolled Students
              </h4>
              <p className="text-lg font-semibold text-dark dark:text-white">
                {courseStudents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-xl font-semibold text-dark dark:text-white">
              Student Progress
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-body-color text-sm dark:text-dark-6">
                {courseStudents.length} student
                {courseStudents.length !== 1 ? "s" : ""} enrolled
              </span>
              <button
                onClick={fetchStudentProgress}
                className="ml-2 flex items-center rounded-lg bg-primary px-3 py-1 text-sm text-white hover:bg-primary/90"
                disabled={isLoadingProgress}
              >
                <svg
                  className="mr-1 h-3 w-3"
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
                Refresh Progress
              </button>
            </div>
          </div>

          {progressError && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400"
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
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Progress data: {progressError}
                </p>
              </div>
            </div>
          )}

          {isLoadingStudents ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="text-body-color ml-3 dark:text-dark-6">
                Loading students...
              </span>
            </div>
          ) : studentsError ? (
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
                <p className="text-red-800 dark:text-red-200">
                  {studentsError}
                </p>
              </div>
            </div>
          ) : courseStudents.length === 0 ? (
            <div className="py-12 text-center">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">
                No students enrolled
              </h3>
              <p className="text-body-color mt-2 dark:text-dark-6">
                This course doesn&apos;t have any students enrolled yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courseStudents.map((student) => {
                const progress = getStudentProgress(student.id);

                return (
                  <div
                    key={student.id}
                    className="rounded-lg border border-stroke p-4 dark:border-dark-3"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-medium text-white">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h5 className="font-medium text-dark dark:text-white">
                            {student.name}
                          </h5>
                          <p className="text-body-color text-sm dark:text-dark-6">
                            {student.email}
                          </p>
                          <p className="text-body-color text-xs dark:text-dark-6">
                            ID: #{student.id}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(student.level)}`}
                      >
                        {student.level}
                      </span>
                    </div>

                    <div className="border-t border-stroke pt-3 dark:border-dark-3">
                      {isLoadingProgress ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                          <span className="text-body-color ml-2 text-xs dark:text-dark-6">
                            Loading progress...
                          </span>
                        </div>
                      ) : progress ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {progress.completed_quizzes}
                            </div>
                            <div className="text-body-color text-xs dark:text-dark-6">
                              Completed Quizzes
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              {progress.pending_quizzes}
                            </div>
                            <div className="text-body-color text-xs dark:text-dark-6">
                              not attended Quizzes
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-center">
                          <span className="text-body-color text-xs dark:text-dark-6">
                            No progress data available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-7.5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            Course Management
          </h3>
          <p className="text-body-color dark:text-dark-6">
            Manage and view all your courses
          </p>
        </div>
        <button
          onClick={fetchCourses}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
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

      {isLoadingCourses ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading courses...
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
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-12 text-center">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">
            No courses found
          </h3>
          <p className="text-body-color mt-2 dark:text-dark-6">
            You don&apos;t have any courses assigned yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="cursor-pointer rounded-lg border border-stroke p-6 transition-all hover:border-primary/50 hover:shadow-lg dark:border-dark-3"
              onClick={() => handleViewCourse(course)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white">
                      {course.name}
                    </h4>
                    <p className="text-body-color text-sm dark:text-dark-6">
                      {course.code}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getLevelBadgeColor(course.level)}`}
                >
                  Level {course.level} - {getLevelName(course.level)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-color text-sm dark:text-dark-6">
                    Course ID:
                  </span>
                  <span className="text-sm font-medium text-dark dark:text-white">
                    #{course.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color text-sm dark:text-dark-6">
                    Level:
                  </span>
                  <span className="text-sm font-medium text-dark dark:text-white">
                    {getLevelName(course.level)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-stroke pt-4 dark:border-dark-3">
                <button className="flex w-full items-center justify-center gap-2 font-medium text-primary hover:text-primary/80">
                  <span>View Course Details</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Courses
            </h4>
            <p className="text-2xl font-bold text-dark dark:text-white">
              {courses.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Beginner Level
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {courses.filter((c) => c.level === 1).length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Intermediate Level
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {courses.filter((c) => c.level === 2).length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Advanced Level
            </h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {courses.filter((c) => c.level >= 3).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
