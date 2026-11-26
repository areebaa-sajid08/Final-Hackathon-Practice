import Brand from "./Brand.jsx";

export default function LoadingIndicator() {
    return (
        <span className="inline-flex items-center justify-center" role="status" aria-label="Loading" aria-live="polite">
            <Brand compact loading />
        </span>
    );
}
