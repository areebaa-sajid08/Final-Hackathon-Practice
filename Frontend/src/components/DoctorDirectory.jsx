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
        <section className={`mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 ${fullPage ? "min-h-[65vh]" : ""}`} id="doctors">
            <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Your care team</p>
                    <h2 className="text-3xl font-black tracking-tight text-emerald-950 dark:text-slate-100 sm:text-4xl">Find the right doctor</h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Browse clinicians and request a time that works for you.</p>
                </div>
                <label className="flex w-full items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3.5 text-emerald-800 shadow-lg shadow-emerald-950/5 backdrop-blur transition focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-900/80 dark:text-emerald-200 lg:max-w-sm">
                    <Icon name="search" size={18} />
                    <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or specialty" aria-label="Search doctors by name or specialty" />
                </label>
            </div>

            {error && (
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-rose-100 bg-rose-50/80 p-5 text-rose-900 sm:flex-row sm:items-center">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-rose-700 dark:bg-rose-950 dark:text-rose-300"><Icon name="activity" /></span>
                    <div className="min-w-0 flex-1">
                        <strong className="text-sm">Doctors are temporarily unavailable</strong>
                        <p className="mt-1 break-words text-xs text-rose-800/80">{error}</p>
                    </div>
                    <button className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-900" type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
                </div>
            )}

            {loading ? (
                <div className="grid min-h-48 place-items-center"><LoadingIndicator /></div>
            ) : doctors.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {doctors.map(doctor => <DoctorCard key={doctor._id} doctor={doctor} onBook={onBook} />)}
                </div>
            ) : !error ? (
                <div className="grid justify-items-center gap-2 rounded-3xl border border-dashed border-emerald-900/15 bg-white/60 px-5 py-14 text-center dark:border-white/10 dark:bg-slate-900/50">
                    <span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon name="doctor" size={24} /></span>
                    <h3 className="mt-2 text-base font-bold text-emerald-950 dark:text-slate-100">No doctors found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Try a different search, or check back later.</p>
                </div>
            ) : null}
        </section>
    );
}
