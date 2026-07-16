"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("archi-theme-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("archi-theme-change", onStoreChange);
      };
    },
    () => (localStorage.getItem("archiv-theme") === "dark" ? "dark" : "light") as Theme,
    () => "light" as Theme
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    localStorage.setItem("archiv-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("archi-theme-change"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
