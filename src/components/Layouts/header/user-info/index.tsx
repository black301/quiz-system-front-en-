"use client";
import { useRouter } from "next/navigation";
import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/auth/sign-in";
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          name: parsedUser.name || "Unknown User",
          email: parsedUser.email || "unknown@example.com",
        });
      } catch {
        console.error("Invalid user JSON in localStorage.");
      }
    }
  }, []);

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          {/* Minimal view on small screens */}
          <span className="text-dark dark:text-white sm:hidden">
            <UserIcon />
          </span>

          {/* Full info for larger screens */}
          <figcaption className="hidden items-center gap-1 font-medium text-dark dark:text-dark-6 sm:flex">
            <UserIcon />
            <span>{user.name}</span>
            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="w-full max-w-xs border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark sm:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-3 hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />
            <span className="mr-auto text-left text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-3 hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            <LogOutIcon />
            <span className="text-left text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
