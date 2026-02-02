import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeSkin = "light" | "cyberpunk";

interface ThemeContextType {
  skin: ThemeSkin;
  setSkin: (skin: ThemeSkin) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [skin, setSkin] = useState<ThemeSkin>(() => {
    const saved = localStorage.getItem("dive-coder-skin");
    return (saved as ThemeSkin) || "light";
  });

  useEffect(() => {
    localStorage.setItem("dive-coder-skin", skin);
    document.documentElement.classList.remove("light", "cyberpunk");
    document.documentElement.classList.add(skin);
  }, [skin]);

  return (
    <ThemeContext.Provider value={{ skin, setSkin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
