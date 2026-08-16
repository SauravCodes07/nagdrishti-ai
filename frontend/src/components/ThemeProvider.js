"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("nagdrishti_theme");
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        applyTheme(stored);
      } else {
        // Default to dark mode for civic-tech command center feel, but allow instant toggle
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "dark"; // Default dark
        setThemeState(initial);
        applyTheme(initial);
      }
    } catch (_) {}
  }, []);

  const applyTheme = (t) => {
    if (typeof document === "undefined") return;
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  };

  const setTheme = (newTheme) => {
    const validTheme = newTheme === "light" ? "light" : "dark";
    setThemeState(validTheme);
    try {
      localStorage.setItem("nagdrishti_theme", validTheme);
    } catch (_) {}
    applyTheme(validTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
