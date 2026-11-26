import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AuthModal from "./components/AuthModal.jsx";
import Brand from "./components/Brand.jsx";
import BookingModal from "./components/BookingModal.jsx";
import DoctorDashboard from "./components/DoctorDashboard.jsx";
import DoctorDirectory from "./components/DoctorDirectory.jsx";
import Icon from "./components/Icon.jsx";
import LoadingIndicator from "./components/LoadingIndicator.jsx";
import NotificationCenter from "./components/NotificationCenter.jsx";
import PatientDashboard from "./components/PatientDashboard.jsx";
import ProfileAvatar from "./components/ProfileAvatar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { api, clearToken, getToken, setToken } from "./lib/api.js";

function PublicHeader({ onLogin, onRegister, onDoctors, onHome, active, theme, onToggleTheme }) {
    return (
        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 sm:py-7">
            <button type="button" className="rounded-xl transition hover:-translate-y-0.5" onClick={onHome} aria-label="Carewell home"><Brand /></button>
            <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
                <button className={`text-xs font-bold transition hover:text-emerald-700 dark:hover:text-emerald-300 ${active === "home" ? "text-emerald-950 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`} type="button" onClick={onHome}>Home</button>
                <button className={`text-xs font-bold transition hover:text-emerald-700 dark:hover:text-emerald-300 ${active === "doctors" ? "text-emerald-950 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`} type="button" onClick={onDoctors}>Find a doctor</button>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                <button className="rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-white/70 dark:text-emerald-200 dark:hover:bg-white/10 sm:px-4" type="button" onClick={onLogin}>Sign in</button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-4" type="button" onClick={onRegister}>Get started <Icon name="arrow" size={15} /></button>
            </div>
        </header>
    );
}

function PublicLanding({ onLogin, onRegister, onBook, search, setSearch }) {
    return (
        <>
            <section className="relative mx-auto grid min-h-[620px] w-full max-w-7xl items-center gap-10 overflow-hidden px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pb-24 lg:pt-12">
                <div className="pointer-events-none absolute -left-40 top-10 size-96 rounded-full bg-emerald-200/50 blur-3xl" />
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800 shadow-lg shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-emerald-200"><span className="size-2 animate-pulse rounded-full bg-teal-500" /> Your health, in good hands</span>
                    <h1 className="mt-7 text-5xl font-black leading-[1.03] tracking-[-0.06em] text-emerald-950 dark:text-slate-100 sm:text-6xl lg:text-7xl">Care that fits<br />your <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">life.</span></h1>
                    <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">Find a doctor you trust, book a time that works, and keep your care journey moving — all in one calm, simple place.</p>
                    <form className="mt-8 flex flex-col gap-2 rounded-2xl border border-white bg-white/80 p-2 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/80 sm:flex-row sm:items-center" onSubmit={event => { event.preventDefault(); document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" }); }}>
                        <Icon className="ml-3 hidden shrink-0 text-emerald-700 sm:block" name="search" size={19} />
                        <input className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-emerald-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500" aria-label="Search a doctor or specialty" value={search} onChange={event => setSearch(event.target.value)} placeholder="Doctor name or specialty" />
                        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5" type="submit">Find care <Icon name="arrow" size={16} /></button>
                    </form>
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-2"><Icon name="shield" size={16} className="text-emerald-700" /> Private & secure</span>
                        <span className="inline-flex items-center gap-2"><Icon name="clock" size={16} className="text-emerald-700" /> Request anytime</span>
                    </div>
                </div>
                <div className="group relative mx-auto flex min-h-[390px] w-full max-w-lg items-center justify-center perspective-[1000px] sm:min-h-[470px]">
                    <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-emerald-200 via-teal-100 to-white opacity-80 blur-2xl dark:from-emerald-900 dark:via-teal-950 dark:to-slate-900" />
                    <div className="absolute size-[min(74vw,390px)] rounded-full border border-emerald-700/10 bg-gradient-to-br from-white/70 to-emerald-100/60 shadow-[inset_-20px_-30px_70px_rgba(13,91,67,0.12),0_40px_100px_rgba(13,91,67,0.12)] transition duration-700 group-hover:rotate-6 group-hover:scale-105 dark:border-emerald-300/10 dark:from-slate-800/80 dark:to-emerald-950/80 [transform-style:preserve-3d]" />
                    <div className="relative grid size-56 place-items-center rounded-[3rem] border border-white/80 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-950 text-white shadow-[20px_25px_60px_rgba(13,91,67,0.35)] transition duration-700 group-hover:-rotate-y-12 group-hover:rotate-x-6 group-hover:scale-105 sm:size-64 [transform-style:preserve-3d]">
                        <div className="absolute inset-5 rounded-[2.4rem] border border-white/20" />
                        <span className="grid size-28 place-items-center rounded-[2rem] bg-white/10 shadow-inner backdrop-blur"><Icon name="heart" size={58} /></span>
                        <span className="absolute -bottom-5 -right-7 grid size-16 place-items-center rounded-2xl border border-white/70 bg-white text-emerald-800 shadow-xl dark:border-white/10 dark:bg-slate-800 dark:text-emerald-300"><Icon name="check" size={27} /></span>
                    </div>
                    <div className="absolute left-0 top-[18%] rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur transition duration-500 group-hover:-translate-y-2 group-hover:-rotate-3 dark:border-white/10 dark:bg-slate-900/85 sm:left-2">
                        <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><Icon name="heart" size={17} /></span><span><strong className="block text-xs text-emerald-950 dark:text-slate-100">Care, made personal</strong><small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">One step at a time</small></span></span>
                    </div>
                    <div className="absolute bottom-[16%] right-0 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur transition duration-500 group-hover:translate-y-2 group-hover:rotate-2 dark:border-white/10 dark:bg-slate-900/90 sm:right-1">
                        <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon name="calendar" size={17} /></span><span><strong className="block text-xs text-emerald-950 dark:text-slate-100">Your next step</strong><small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">Find a clinician</small></span><Icon className="text-emerald-700 dark:text-emerald-300" name="arrow" size={16} /></span>
                    </div>
                    <span className="absolute right-[18%] top-[12%] text-4xl text-amber-400 transition duration-500 group-hover:rotate-45">✳</span>
                    <span className="absolute bottom-[17%] left-[12%] text-2xl text-teal-500 transition duration-500 group-hover:-rotate-45">✳</span>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-7xl gap-3 px-5 pb-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-950 p-4 text-white shadow-lg shadow-emerald-950/10 dark:bg-emerald-950 sm:col-span-2 lg:col-span-1"><span className="text-sm font-bold">A clearer path to care</span></div>
                {[
                    { icon: "doctor", title: "Find your doctor", text: "Explore active clinicians" },
                    { icon: "calendar", title: "Request a visit", text: "Choose a date and time" },
                    { icon: "activity", title: "Stay in the loop", text: "Follow your request status" }
                ].map(item => (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-lg shadow-emerald-950/5 backdrop-blur transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900/60" key={item.title}>
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon name={item.icon} size={19} /></span>
                        <span><strong className="block text-xs text-emerald-950 dark:text-slate-100">{item.title}</strong><small className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{item.text}</small></span>
                    </div>
                ))}
            </section>

            <DoctorDirectory search={search} setSearch={setSearch} onBook={onBook} />

            <section className="mx-auto mb-12 flex w-full max-w-7xl flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"><Icon name="heart" size={23} /></span>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">A little more human</p>
                    <h2 className="mt-1 text-xl font-black text-emerald-950 dark:text-slate-100">Your care should feel like yours.</h2>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">From your first search to your next appointment, Carewell keeps the details clear and the focus on you.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/10 bg-white px-5 py-3 text-xs font-bold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900 dark:text-emerald-200" type="button" onClick={onRegister}>Create your account <Icon name="arrow" size={15} /></button>
            </section>
            <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-emerald-900/10 px-5 py-6 text-center dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
                <Brand compact />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Carewell Clinic. Your wellbeing, always.</span>
                <button className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300" type="button" onClick={onLogin}>Patient sign in</button>
            </footer>
        </>
    );
}

function SideNavigation({ user, active, onNavigate, onLogout }) {
    const items = user.role === "patient"
        ? [
            { id: "overview", label: "Overview", icon: "grid" },
            { id: "doctors", label: "Find a doctor", icon: "doctor" },
            { id: "appointments", label: "Appointments", icon: "calendar" }
        ]
        : user.role === "doctor"
            ? [{ id: "overview", label: "My dashboard", icon: "grid" }]
            : [
                { id: "overview", label: "Overview", icon: "grid" },
                { id: "users", label: "People", icon: "users" },
                { id: "appointments", label: "Appointments", icon: "calendar" }
            ];

    return (
        <aside className="relative z-20 flex flex-col border-b border-white/60 bg-white/75 px-4 py-4 shadow-lg shadow-emerald-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
            <button type="button" className="mb-5 hidden rounded-xl text-left lg:block" onClick={() => onNavigate("overview")}><Brand /></button>
            <div className="mb-3 hidden px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 lg:block">Workspace</div>
            <nav className="flex gap-2 overflow-x-auto lg:grid lg:overflow-visible" aria-label="Dashboard navigation">
                {items.map(item => (
                    <button className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${active === item.id ? "bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-900/15" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-100"}`} type="button" key={item.id} onClick={() => onNavigate(item.id)}>
                        <Icon name={item.icon} size={18} /><span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto hidden pt-8 lg:block">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 p-4 dark:from-emerald-950 dark:to-slate-900">
                    <span className="grid size-8 place-items-center rounded-xl bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300"><Icon name="heart" size={16} /></span>
                    <strong className="mt-3 block text-[11px] text-emerald-950 dark:text-slate-100">Here for your health</strong>
                    <small className="mt-1 block text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Manage your clinic care with confidence.</small>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-emerald-950/5 pt-4 dark:border-white/10">
                    {user.role === "doctor"
                        ? <ProfileAvatar name={user.name} imageUrl={user.profileImage} size="table" />
                        : <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-800">{user.name?.trim()?.[0]?.toUpperCase() || "C"}</span>}
                    <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-emerald-950 dark:text-slate-100">{user.name}</strong><small className="mt-1 block text-[10px] capitalize text-slate-500 dark:text-slate-400">{user.role}</small></span>
                    <button className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-950 dark:hover:text-rose-300" type="button" onClick={onLogout} aria-label="Sign out"><Icon name="logout" size={17} /></button>
                </div>
            </div>
        </aside>
    );
}

function BookingSuccess({ result, onClose }) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-950/55 p-4 backdrop-blur-md">
            <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-gradient-to-br from-white to-emerald-50 p-8 text-center shadow-2xl shadow-emerald-950/30 dark:border-white/10 dark:from-slate-900 dark:to-emerald-950" role="dialog" aria-modal="true" aria-labelledby="success-title">
                <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-900/20"><Icon name="check" size={28} /></span>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Request sent</p>
                <h2 id="success-title" className="mt-2 text-2xl font-black text-emerald-950 dark:text-slate-100">Your appointment is in motion.</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">The clinic received your request. You can track its status in your appointments.</p>
                <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5" type="button" onClick={onClose}>View my appointments <Icon name="arrow" size={17} /></button>
                {result?.appointment?.status && <span className="mt-4 block text-[10px] text-slate-400">Status: {result.appointment.status}</span>}
            </section>
        </div>
    );
}

export default function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem("carewell-theme") === "dark" ? "dark" : "light");
    const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
    const [user, setUser] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(Boolean(getToken()));
    const [activeView, setActiveView] = useState("overview");
    const [authMode, setAuthMode] = useState("");
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [pendingDoctor, setPendingDoctor] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        localStorage.setItem("carewell-theme", theme);
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    useEffect(() => {
        if (!hasToken) return undefined;
        let current = true;
        api.get("/auth/me")
            .then(result => { if (current) setUser(result.user); })
            .catch(error => {
                if (!current) return;
                clearToken();
                setHasToken(false);
                setNotice(error.status === 401 ? "Your session expired. Please sign in again." : error.message);
            })
            .finally(() => { if (current) setSessionLoading(false); });
        return () => { current = false; };
    }, [hasToken]);

    function handleAuthSuccess(result) {
        if (!result.token || !result.user) throw new Error("The API did not return a signed-in user.");
        setToken(result.token);
        setHasToken(true);
        setUser(result.user);
        setAuthMode("");
        setActiveView("overview");
        if (pendingDoctor && result.user.role === "patient") setBookingDoctor(pendingDoctor);
        else if (pendingDoctor && result.user.role !== "patient") setNotice("Only patient accounts can request appointments.");
        setPendingDoctor(null);
    }

    function startBooking(doctor) {
        if (!user) {
            setPendingDoctor(doctor);
            setAuthMode("login");
            return;
        }
        if (user.role !== "patient") {
            setNotice("Only patient accounts can request appointments.");
            return;
        }
        setBookingDoctor(doctor);
    }

    async function signOut() {
        try {
            await api.post("/auth/logout", {});
        } catch {
            setNotice("Signed out on this device. The clinic API could not confirm logout.");
        }
        clearToken();
        setHasToken(false);
        setUser(null);
        setActiveView("overview");
    }

    if (sessionLoading) {
        return <div data-theme={theme} className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-950 dark:to-slate-900"><LoadingIndicator /></div>;
    }

    if (!user) {
        return (
            <div data-theme={theme} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f3faf5] via-[#f8fbf8] to-[#e6f4ee] text-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950 dark:text-slate-100">
                <div className="pointer-events-none fixed -left-40 top-40 size-96 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="pointer-events-none fixed -right-40 bottom-10 size-96 rounded-full bg-teal-300/20 blur-3xl" />
                <PublicHeader
                    onLogin={() => setAuthMode("login")}
                    onRegister={() => setAuthMode("register")}
                    onDoctors={() => setActiveView("doctors")}
                    onHome={() => setActiveView("overview")}
                    active={activeView === "doctors" ? "doctors" : "home"}
                    theme={theme}
                    onToggleTheme={() => setTheme(current => current === "dark" ? "light" : "dark")}
                />
                <main className="relative z-10">
                    {activeView === "doctors" ? (
                        <DoctorDirectory search={search} setSearch={setSearch} onBook={startBooking} fullPage />
                    ) : (
                        <PublicLanding onLogin={() => setAuthMode("login")} onRegister={() => setAuthMode("register")} onBook={startBooking} search={search} setSearch={setSearch} />
                    )}
                </main>
                {notice && <div className="fixed bottom-5 left-1/2 z-40 flex w-[min(92vw,480px)] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-xs text-emerald-950 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}
                {authMode && <AuthModal mode={authMode} onClose={() => { setAuthMode(""); setPendingDoctor(null); }} onSuccess={handleAuthSuccess} />}
                {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onBooked={result => { setBookingDoctor(null); setBookingResult(result); }} />}
                {bookingResult && <BookingSuccess result={bookingResult} onClose={() => { setBookingResult(null); setHasToken(true); setActiveView("appointments"); setRefreshKey(value => value + 1); }} />}
            </div>
        );
    }

    const isAdmin = user.role === "admin";
    const isPatient = user.role === "patient";
    const sectionTitle = activeView === "overview" ? "Overview" : activeView === "doctors" ? "Find a doctor" : activeView === "users" ? "People" : "Appointments";
    return (
        <div data-theme={theme} className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100/70 via-[#f5f9f6] to-teal-50/60 text-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950 dark:text-slate-100 lg:flex">
            <SideNavigation user={user} active={activeView} onNavigate={setActiveView} onLogout={signOut} />
            <div className="min-w-0 flex-1">
                <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-4 border-b border-white/70 bg-white/75 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-8">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400 dark:text-slate-500"><span className="hidden font-bold text-emerald-900 dark:text-emerald-200 sm:inline">Carewell</span><Icon name="chevron" size={14} /><strong className="truncate text-emerald-950 dark:text-slate-100">{sectionTitle}</strong></div>
                    <div className="flex items-center gap-3">
                        {user.role !== "admin" && (!isPatient || activeView === "doctors") && <NotificationCenter onOpenAppointments={() => setActiveView(isPatient ? "appointments" : "overview")} />}
                        <ThemeToggle theme={theme} onToggle={() => setTheme(current => current === "dark" ? "light" : "dark")} />
                        <span className="hidden items-center gap-1.5 text-[10px] font-semibold text-emerald-800/60 dark:text-emerald-200/60 sm:inline-flex"><Icon name="shield" size={15} className="text-emerald-600 dark:text-emerald-300" /> Secure portal</span>
                        {user.role === "doctor"
                            ? <ProfileAvatar name={user.name} imageUrl={user.profileImage} size="table" />
                            : <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-black text-emerald-800">{user.name?.[0]?.toUpperCase() || "C"}</span>}
                    </div>
                </header>
                <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 lg:p-10">
                    {isPatient && activeView === "doctors" ? (
                        <DoctorDirectory search={search} setSearch={setSearch} onBook={startBooking} fullPage />
                    ) : isPatient ? (
                        <PatientDashboard user={user} refreshKey={refreshKey} onBrowseDoctors={() => setActiveView("doctors")} />
                    ) : user.role === "doctor" ? (
                        <DoctorDashboard user={user} />
                    ) : isAdmin ? (
                        <AdminDashboard user={user} section={activeView} />
                    ) : (
                        <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"><Icon name="shield" /><div><strong>Account role unavailable</strong><p className="mt-1 text-xs">Contact your clinic administrator to restore access.</p></div></div>
                    )}
                </main>
            </div>
            {notice && <div className="fixed bottom-5 left-1/2 z-40 flex w-[min(92vw,480px)] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-xs text-emerald-950 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}
            {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode("")} onSuccess={handleAuthSuccess} />}
            {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onBooked={result => { setBookingDoctor(null); setBookingResult(result); }} />}
            {bookingResult && <BookingSuccess result={bookingResult} onClose={() => { setBookingResult(null); setActiveView("appointments"); setRefreshKey(value => value + 1); }} />}
        </div>
    );
}
