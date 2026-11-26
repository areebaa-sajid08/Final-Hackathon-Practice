import Icon from "./Icon.jsx";

export default function Brand({ compact = false, loading = false }) {
    return (
        <span className={`inline-flex items-center gap-2 font-black tracking-tight text-emerald-950 dark:text-emerald-100 ${compact ? "text-lg" : "text-xl"}`}>
            <span className={`grid place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/20 ${compact ? "size-8" : "size-10"} ${loading ? "motion-safe:animate-pulse" : ""}`}>
                <Icon name="heart" size={compact ? 16 : 19} />
            </span>
            <span>carewell<span className="text-emerald-500">.</span></span>
        </span>
    );
}
