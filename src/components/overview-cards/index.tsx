"use client";
import { useEffect, useState } from "react";
import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "./fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

type OverviewItem = {
  value: number;
  growthRate?: number;
};

type OverviewData = {
  quizzes: OverviewItem;
  students: OverviewItem;
  submissions: OverviewItem;
};

export function OverviewCardsGroup() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getOverviewData();
        setData(result);
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading || !data) {
    return <p>Loading...</p>;
  }

  const { quizzes, students, submissions } = data;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Total Quizzes"
        data={{ ...quizzes, value: compactFormat(quizzes.value) }}
        Icon={icons.Product}
      />
      <OverviewCard
        label="Total Students"
        data={{ ...students, value: compactFormat(students.value) }}
        Icon={icons.Users}
      />
      <OverviewCard
        label="Total Submissions"
        data={{ ...submissions, value: compactFormat(submissions.value) }}
        Icon={icons.Views}
      />
    </div>
  );
}
