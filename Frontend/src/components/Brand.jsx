import Icon from "./Icon.jsx";

export default function Brand({ compact = false, loading = false }) {
    return (
        <span className={`brand ${compact ? "brand-compact" : ""} ${loading ? "brand-loading" : ""}`}>
            <span className="brand-mark"><Icon name="heart" size={18} /></span>
            <span>carewell<span className="brand-period">.</span></span>
        </span>
    );
}
