import { apiFetch } from "@/lib/api"; // or your actual path

export async function getOverviewData() {
  const data = await apiFetch("/instructor/statistics/summary/");

  return {
    quizzes: {
      value: data.total_quizzes,
    },
    students: {
      value: data.total_students,
    },
    submissions: {
      value: data.total_submissions,
    },
  };
}
