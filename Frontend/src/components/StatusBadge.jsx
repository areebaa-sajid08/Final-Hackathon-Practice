const labels = {
    pending: "Awaiting review",
    approved: "Confirmed",
    rejected: "Declined",
    cancelled: "Cancelled",
    expired: "Expired"
};

export default function StatusBadge({ status }) {
    return (
        <span className={`status-badge status-${status}`}>
            <span className="status-dot" />
            {labels[status] || status}
        </span>
    );
}
