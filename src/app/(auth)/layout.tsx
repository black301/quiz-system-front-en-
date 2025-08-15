// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeToggle from "@/components/Auth/theme-toggle"; // new component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Quiz-Room",
    default: "Quiz-Room",
  },
  icons: {
    icon: "/favicon.ico", // or .png/.svg
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-black transition-colors duration-300 dark:bg-gray-900 dark:text-white`}
      >
        <ThemeToggle /> {/* insert client theme toggle button */}
        {children}
      </body>
    </html>
  );
}
