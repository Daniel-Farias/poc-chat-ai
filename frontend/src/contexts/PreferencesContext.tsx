import { createContext, useCallback, useState, useContext, useEffect } from "react";

interface PreferencesContextData {
  isLightTheme: boolean;
  toggleTheme: () => void;
}

interface Props {
  children: React.ReactNode;
}

const PreferencesContext = createContext<PreferencesContextData>(
  {} as PreferencesContextData
);

const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches
  ? "light"
  : "dark";

export function PreferencesProvider({ children }: Props) {
  const [isLightTheme, setIsLightTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || systemTheme;
    return savedTheme === "light";
  });

  const toggleTheme = useCallback(() => {
    const newTheme = isLightTheme ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    setIsLightTheme((prev) => !prev);
  }, [isLightTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", !isLightTheme);
  }, [isLightTheme]);

  return (
    <PreferencesContext.Provider value={{ isLightTheme, toggleTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextData {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used within an PreferencesProvider"
    );
  }
  return context;
}
