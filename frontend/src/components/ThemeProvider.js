"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  const [mounted, setMounted] = useState(false);

  const applyThemeToDOM = useCallback((t) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Temporarily disable CSS transitions during theme switch to prevent multi-element transition lag
    root.classList.add("theme-transitioning");

    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }

    // Force style flush and remove class in next animation frame
    requestAnimationFrame(() => {
      root.classList.remove("theme-transitioning");
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("nagdrishti_theme");
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        applyThemeToDOM(stored);
      } else {
        setThemeState("dark");
        applyThemeToDOM("dark");
      }
    } catch (_) {
      setThemeState("dark");
      applyThemeToDOM("dark");
    }
  }, [applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme) => {
      const validTheme = newTheme === "light" ? "light" : "dark";
      setThemeState(validTheme);
      try {
        localStorage.setItem("nagdrishti_theme", validTheme);
      } catch (_) {}
      applyThemeToDOM(validTheme);
    },
    [applyThemeToDOM]
  );

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
