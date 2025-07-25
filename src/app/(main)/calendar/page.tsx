import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calender Page",
};

const CalendarPage = () => {
  return (
    <>
      <Breadcrumb pageName="Calendar" />
      <CalendarBox />
    </>
  );
};

export default CalendarPage;
