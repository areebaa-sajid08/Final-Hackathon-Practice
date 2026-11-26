const labels = {
    pending: "Awaiting review",
    approved: "Confirmed",
    rejected: "Declined",
    cancelled: "Cancelled",
    expired: "Expired"
};

export default function StatusBadge({ status }) {
    const colors = {
        pending: "border-amber-200 bg-amber-50 text-amber-800",
        approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
        rejected: "border-rose-200 bg-rose-50 text-rose-800",
        cancelled: "border-slate-200 bg-slate-100 text-slate-600",
        expired: "border-violet-200 bg-violet-50 text-violet-800"
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${colors[status] || "border-slate-200 bg-slate-100 text-slate-600"}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {labels[status] || status}
        </span>
    );
}
