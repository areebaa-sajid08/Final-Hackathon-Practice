import Brand from "./Brand.jsx";

export default function LoadingIndicator() {
    return (
        <span className="loading-indicator" role="status" aria-label="Loading" aria-live="polite">
            <Brand compact loading />
        </span>
    );
}
