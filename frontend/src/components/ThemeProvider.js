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
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("nagdrishti_theme");
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        applyThemeToDOM(stored);
      } else {
        // Default to dark theme for civic command center look, but allow instant switch
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

  const toggleTheme = useCallback(
    (event) => {
      const next = theme === "dark" ? "light" : "dark";

      // If document.startViewTransition is supported, perform smooth radial/downward wave transition
      if (
        typeof document !== "undefined" &&
        document.startViewTransition &&
        typeof window !== "undefined" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        let x = window.innerWidth / 2;
        let y = 32;

        if (event && typeof event.clientX === "number" && typeof event.clientY === "number" && (event.clientX !== 0 || event.clientY !== 0)) {
          x = event.clientX;
          y = event.clientY;
        }

        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
          setTheme(next);
        });

        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 400,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {
            setTheme(next);
          });
      } else {
        setTheme(next);
      }
    },
    [theme, setTheme]
  );

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
