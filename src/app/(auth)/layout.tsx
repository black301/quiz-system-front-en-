// app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = stored || 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 shadow hover:scale-105 transition"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {children}
      </body>
    </html>
  );
}
