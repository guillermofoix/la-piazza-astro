import { getUserDetails } from "@/lib/shopify";
import type { user } from "@/lib/shopify/types";
import Cookies from "js-cookie";
import React, { useEffect, useState, useRef } from "react";
import Gravatar from "react-gravatar";
import { BsPerson } from "react-icons/bs";

export const fetchUser = async () => {
  try {
    const accessToken = Cookies.get("token");

    if (!accessToken) {
      return null;
    } else {
      const userDetails: user = await getUserDetails(accessToken);
      return userDetails.customer;
    }
  } catch (error) {
    return null;
  }
};

const NavUser = ({ pathname }: { pathname: string }) => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getUser = async () => {
    const userInfo = await fetchUser();
    setUser(userInfo);
  };

  useEffect(() => {
    getUser();
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    // Force a small reload or redirect to home to clean up state
    window.location.href = "/";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <div className="flex items-center">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-x-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="h-8 w-8 border-2 border-primary rounded-full overflow-hidden shadow-sm">
              <Gravatar
                email={user?.email || "pizza@example.com"}
                size={32}
                className="rounded-full"
              />
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm font-semibold text-text-dark dark:text-darkmode-text-dark">
                {user?.firstName}
              </span>
              <svg
                className={`w-4 h-4 text-neutral-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-darkmode-body border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-neutral-100 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Sesión iniciada como
                </p>
                <p className="text-sm font-bold truncate dark:text-white">
                  {user.email}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <a
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-2xl text-text-dark dark:text-white group relative"
          href="/login"
          aria-label="login"
        >
          <BsPerson className="group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Iniciar Sesión
          </span>
        </a>
      )}
    </div>
  );
};

export default NavUser;
