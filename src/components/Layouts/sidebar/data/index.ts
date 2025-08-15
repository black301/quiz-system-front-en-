import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "courses management",
        icon: Icons.Table,
        url: "/courses",
        items: [],
      },
      {
        title: "Submissions",
        icon: Icons.PieChart,
        url: "/grading/quiz-grading-management-page",
        items: [],
      },
      {
        title: "Student management",
        icon: Icons.User,
        url: "/students/viewstudents",
        items: [],
      },
      {
        title: "view Quizzes",
        icon: Icons.Authentication,
        url: "/quizzes/viewquizzes",
        items: [],
      },
      {
        title: "Create Quizzes",
        icon: Icons.Alphabet,
        url: "/quizzes/createquiz",
        items: [],
      },
    ],
  },
];
