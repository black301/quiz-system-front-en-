import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getCoursesOverviewData } from "@/services/charts.services";
import { CoursesOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};
// courses Overview
export async function CoursesOverview({ className, timeFrame }: PropsType) {
  const data = await getCoursesOverviewData(timeFrame);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {timeFrame || "CS101"}
        </h2>

        <PeriodPicker
          items={["CS101", "IT101"]}
          defaultValue={timeFrame || "CS101"}
          sectionKey="Courses_Overview"
        />
      </div>

      <CoursesOverviewChart data={data} />
    </div>
  );
}
