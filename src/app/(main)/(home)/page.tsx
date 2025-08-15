import { QuizzesOverview } from "@/components/Charts/payments-overview";
import { CoursesOverview } from "@/components/Charts/weeks-profit";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { UsedDevices } from "@/components/Charts/used-devices";
import CalendarBox from "@/components/CalenderBox";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div style={{ marginTop: "24px" }}>
        <CalendarBox />
      </div>
    </>
  );
}
