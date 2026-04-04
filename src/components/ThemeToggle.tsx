"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const OPTIONS: { value: "light" | "dark" | "system"; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-card-bg border border-card-border p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`px-2 py-1.5 rounded-md transition-all ${
            theme === value
              ? "bg-accent/20 text-accent"
              : "text-text-muted hover:text-text"
          }`}
          title={label}
          aria-label={`Switch to ${label} mode`}
        >
          <Icon size={14} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
