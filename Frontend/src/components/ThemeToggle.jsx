import Icon from "./Icon.jsx";

export default function ThemeToggle({ theme, onToggle }) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    return (
        <button
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-900/10 bg-white/70 text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-800/80 dark:text-amber-300 dark:hover:bg-slate-700"
            type="button"
            onClick={onToggle}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
        >
            <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
        </button>
    );
}
