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
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "courses management",
        icon: Icons.Table,
        url: "/courses",
        items: [],
      }, 
      { title: "Submissions",
        icon: Icons.PieChart,
        url: "/grading/quiz-grading-management-page",
        items: []
      },
      {
        title: "Student management",
        icon: Icons.User,
        url: "/students/viewstudents",
        items: [],
      }, 
      { title: "Quizes",
        icon: Icons.Authentication,
        url: "/quizes",
        items: [
          {
            title: "View Quizes",
            url: "/quizes/viewquizes",
          },
          {
            title: "Create Quiz",
            url: "/quizes/createquiz",
          },
        ]
      },
      
    ],
  },
];
