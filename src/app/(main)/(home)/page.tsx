import { Suspense } from "react";
import { OverviewCardsGroup } from "@/components/overview-cards";
import { OverviewCardsSkeleton } from "@/components/overview-cards/skeleton";
import CalendarBox from "@/components/CalenderBox";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
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
