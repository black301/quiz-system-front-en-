"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Quiz {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  duration: number;
  total_points: number;
}

interface CalendarEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  type: "quiz";
}

const CalendarBox = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quizzes on component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Transform quizzes to calendar events when quizzes change
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      startDate: new Date(quiz.start_date),
      endDate: new Date(quiz.end_date),
      type: "quiz",
    }));
    setEvents(calendarEvents);
  }, [quizzes]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiFetch("/instructor/quizzes/");
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  // Get the first day of the current month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get the last day of the current month
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    const startDate = new Date(firstDay);

    // Go back to the first Sunday of the calendar view
    startDate.setDate(startDate.getDate() - getDayOfWeek(firstDay));

    const days = [];
    const currentDateObj = new Date(startDate);

    // Generate 42 days (6 weeks × 7 days)
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);

        // Check if the current day falls within the event date range
        return (
          currentDateObj >=
            new Date(
              eventStart.getFullYear(),
              eventStart.getMonth(),
              eventStart.getDate(),
            ) &&
          currentDateObj <=
            new Date(
              eventEnd.getFullYear(),
              eventEnd.getMonth(),
              eventEnd.getDate(),
            )
        );
      });

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === currentDate.getMonth(),
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        events: dayEvents,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // Format date for display
  const formatEventDate = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = generateCalendarDays();

  if (isLoading) {
    return (
      <div className="w-full max-w-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="text-body-color ml-3 dark:text-dark-6">
            Loading calendar...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-stroke p-4 dark:border-dark-3">
        <h3 className="text-xl font-semibold text-dark dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <svg
              className="h-4 w-4 text-dark dark:text-white"
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
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <svg
              className="h-4 w-4 text-dark dark:text-white"
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

      {error && (
        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-7 bg-primary text-white">
            {dayNames.map((day, index) => (
              <th
                key={day}
                className={`flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5 ${
                  index === 0
                    ? "rounded-tl-[10px]"
                    : index === 6
                      ? "rounded-tr-[10px]"
                      : ""
                }`}
              >
                <span className="hidden lg:block">{day}</span>
                <span className="block lg:hidden">{dayNamesShort[index]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <tr key={weekIndex} className="grid grid-cols-7">
              {calendarDays
                .slice(weekIndex * 7, (weekIndex + 1) * 7)
                .map((day, dayIndex) => (
                  <td
                    key={day.date.toISOString()}
                    className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2 md:h-25 md:p-6 xl:h-31 ${
                      weekIndex === 5 && dayIndex === 0
                        ? "rounded-bl-[10px]"
                        : weekIndex === 5 && dayIndex === 6
                          ? "rounded-br-[10px]"
                          : ""
                    } ${
                      day.events.length > 0
                        ? "border-primary/30 bg-primary/10 dark:border-primary/40 dark:bg-primary/20"
                        : ""
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        day.isCurrentMonth
                          ? day.isToday
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-white"
                            : "text-dark dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {/* Events */}
                    {day.events.length > 0 && (
                      <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                        {/* Small indicator dots for quizzes */}
                        <div className="mb-1 flex gap-1">
                          {day.events.slice(0, 3).map((event, index) => (
                            <div
                              key={event.id}
                              className="h-2 w-2 rounded-full bg-primary"
                              title={event.title}
                            />
                          ))}
                          {day.events.length > 3 && (
                            <span className="text-xs font-medium text-primary">
                              +{day.events.length - 3}
                            </span>
                          )}
                        </div>

                        <span className="text-xs group-hover:text-primary md:hidden">
                          {day.events.length} quiz
                          {day.events.length > 1 ? "es" : ""}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Calendar Legend */}
      <div className="flex items-center justify-between border-t border-stroke p-4 dark:border-dark-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-body-color text-sm dark:text-dark-6">
              <span className="text-body-color text-sm dark:text-dark-6">
                {events.length} quiz{events.length !== 1 ? "es" : ""} this month
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarBox;
