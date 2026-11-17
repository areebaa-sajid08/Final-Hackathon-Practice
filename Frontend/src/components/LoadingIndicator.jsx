import Brand from "./Brand.jsx";

export default function LoadingIndicator({ message }) {
    return (
        <span className="loading-indicator" role="status" aria-live="polite">
            <Brand compact loading />
            {message && <span className="loading-indicator-message">{message}</span>}
        </span>
    );
}
