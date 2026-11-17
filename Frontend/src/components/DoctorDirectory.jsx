import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import DoctorCard from "./DoctorCard.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import Icon from "./Icon.jsx";

export default function DoctorDirectory({ search, setSearch, onBook, fullPage = false }) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let current = true;
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
                const result = await api.get(`/doctors${query}`);
                if (current) setDoctors(result.doctors);
            } catch (requestError) {
                if (current) {
                    setDoctors([]);
                    setError(requestError.message);
                }
            } finally {
                if (current) setLoading(false);
            }
        }, 180);

        return () => {
            current = false;
            window.clearTimeout(timer);
        };
    }, [search, retry]);

    return (
        <section className={`doctor-directory ${fullPage ? "directory-full" : ""}`} id="doctors">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">YOUR CARE TEAM</p>
                    <h2>Find the right doctor</h2>
                    <p className="muted">Browse clinicians and request a time that works for you.</p>
                </div>
                <label className="search-field">
                    <Icon name="search" size={18} />
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or specialty" aria-label="Search doctors by name or specialty" />
                </label>
            </div>

            {error && (
                <div className="api-error" role="alert">
                    <div className="api-error-icon"><Icon name="activity" /></div>
                    <div>
                        <strong>Doctors are temporarily unavailable</strong>
                        <p>{error}</p>
                    </div>
                    <button className="button button-outline" type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
                </div>
            )}

            {loading ? (
                <div className="loading-state"><LoadingIndicator message="Loading doctors…" /></div>
            ) : doctors.length ? (
                <div className="doctor-grid">
                    {doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} onBook={onBook} />)}
                </div>
            ) : !error ? (
                <div className="empty-state directory-empty">
                    <div className="empty-icon"><Icon name="doctor" size={24} /></div>
                    <h3>No doctors found</h3>
                    <p>Try a different search, or check back later.</p>
                </div>
            ) : null}
        </section>
    );
}
