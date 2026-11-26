const labels = {
    pending: "Awaiting review",
    approved: "Confirmed",
    completed: "Completed",
    rejected: "Declined",
    cancelled: "Cancelled",
    expired: "Expired"
};

export default function StatusBadge({ status }) {
    const colors = {
        pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
        approved: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
        completed: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200",
        rejected: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
        cancelled: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        expired: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200"
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${colors[status] || "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {labels[status] || status}
        </span>
    );
}
