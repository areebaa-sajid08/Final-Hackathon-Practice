import { useEffect, useState } from "react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AuthModal from "./components/AuthModal.jsx";
import BookingModal from "./components/BookingModal.jsx";
import DoctorDashboard from "./components/DoctorDashboard.jsx";
import DoctorDirectory from "./components/DoctorDirectory.jsx";
import Icon from "./components/Icon.jsx";
import NotificationCenter from "./components/NotificationCenter.jsx";
import PatientDashboard from "./components/PatientDashboard.jsx";
import { api, clearToken, getToken, setToken } from "./lib/api.js";
import "./App.css";

function Brand({ compact = false }) {
    return (
        <span className={`brand ${compact ? "brand-compact" : ""}`}>
            <span className="brand-mark"><Icon name="heart" size={18} /></span>
            <span>carewell<span className="brand-period">.</span></span>
        </span>
    );
}

function PublicHeader({ onLogin, onRegister, onDoctors, onHome, active }) {
    return (
        <header className="public-header">
            <button type="button" className="brand-button" onClick={onHome} aria-label="Carewell home"><Brand /></button>
            <nav className="public-nav" aria-label="Main navigation">
                <button className={active === "home" ? "nav-link active" : "nav-link"} type="button" onClick={onHome}>Home</button>
                <button className={active === "doctors" ? "nav-link active" : "nav-link"} type="button" onClick={onDoctors}>Find a doctor</button>
            </nav>
            <div className="header-actions">
                <button className="button button-quiet header-signin" type="button" onClick={onLogin}>Sign in</button>
                <button className="button button-primary header-cta" type="button" onClick={onRegister}>Get started <Icon name="arrow" size={16} /></button>
            </div>
        </header>
    );
}

function PublicLanding({ onLogin, onRegister, onBook, search, setSearch }) {
    return (
        <>
            <section className="hero-section">
                <div className="hero-copy">
                    <span className="hero-kicker"><span className="kicker-pulse" /> YOUR HEALTH, IN GOOD HANDS</span>
                    <h1>Care that fits<br />your <span>life.</span></h1>
                    <p className="hero-description">Find a doctor you trust, book a time that works, and keep your care journey moving — all in one calm, simple place.</p>
                    <form className="hero-search" onSubmit={event => { event.preventDefault(); document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" }); }}>
                        <Icon name="search" size={19} />
                        <input aria-label="Search a doctor or specialty" value={search} onChange={event => setSearch(event.target.value)} placeholder="Doctor name or specialty" />
                        <button className="button button-primary" type="submit">Find care <Icon name="arrow" size={16} /></button>
                    </form>
                    <div className="hero-assurance">
                        <span><Icon name="shield" size={16} /> Private & secure</span>
                        <span><Icon name="clock" size={16} /> Request anytime</span>
                    </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="art-orbit orbit-one" />
                    <div className="art-orbit orbit-two" />
                    <div className="hero-portrait">
                        <div className="portrait-halo" />
                        <div className="portrait-face"><span className="portrait-hair" /><span className="portrait-eyes" /><span className="portrait-smile" /></div>
                        <div className="portrait-neck" />
                        <div className="portrait-coat"><span className="coat-collar" /><span className="coat-stethoscope" /></div>
                    </div>
                    <div className="floating-note note-top"><span className="note-icon"><Icon name="heart" size={17} /></span><span><strong>Care, made personal</strong><small>One step at a time</small></span></div>
                    <div className="floating-note note-bottom"><span className="note-check"><Icon name="check" size={17} /></span><span><strong>Your next step</strong><small>Find a clinician</small></span><Icon className="note-arrow" name="arrow" size={16} /></div>
                    <span className="hero-spark spark-one">✳</span><span className="hero-spark spark-two">✳</span>
                </div>
            </section>

            <section className="trust-strip" aria-label="Carewell benefits">
                <div className="trust-intro">A clearer path to care</div>
                <div><span className="trust-icon"><Icon name="doctor" size={18} /></span><span><strong>Find your doctor</strong><small>Explore active clinicians</small></span></div>
                <div><span className="trust-icon"><Icon name="calendar" size={18} /></span><span><strong>Request a visit</strong><small>Choose a date and time</small></span></div>
                <div><span className="trust-icon"><Icon name="activity" size={18} /></span><span><strong>Stay in the loop</strong><small>Follow your request status</small></span></div>
            </section>

            <DoctorDirectory search={search} setSearch={setSearch} onBook={onBook} />

            <section className="care-note">
                <div className="care-note-mark"><Icon name="heart" size={23} /></div>
                <div><p className="eyebrow">A LITTLE MORE HUMAN</p><h2>Your care should feel like yours.</h2><p>From your first search to your next appointment, Carewell keeps the details clear and the focus on you.</p></div>
                <button className="button button-outline" type="button" onClick={onRegister}>Create your account <Icon name="arrow" size={16} /></button>
            </section>
            <footer className="public-footer"><Brand compact /><span>© {new Date().getFullYear()} Carewell Clinic. Your wellbeing, always.</span><button type="button" onClick={onLogin}>Patient sign in</button></footer>
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
        <aside className="sidebar">
            <button type="button" className="brand-button sidebar-brand" onClick={() => onNavigate("overview")}><Brand /></button>
            <div className="sidebar-caption">WORKSPACE</div>
            <nav className="sidebar-nav" aria-label="Dashboard navigation">
                {items.map(item => (
                    <button className={`sidebar-link ${active === item.id ? "selected" : ""}`} type="button" key={item.id} onClick={() => onNavigate(item.id)}>
                        <Icon name={item.icon} size={19} /><span>{item.label}</span>{active === item.id && <span className="sidebar-active-mark" />}
                    </button>
                ))}
            </nav>
            <div className="sidebar-spacer" />
            <div className="sidebar-help"><span className="help-mark"><Icon name="heart" size={16} /></span><strong>Here for your health</strong><small>Manage your clinic care with confidence.</small></div>
            <div className="sidebar-profile">
                <span className="user-avatar">{user.name?.trim()?.[0]?.toUpperCase() || "C"}</span>
                <span className="profile-name"><strong>{user.name}</strong><small>{user.role}</small></span>
                <button className="icon-button logout-button" type="button" onClick={onLogout} aria-label="Sign out"><Icon name="logout" size={18} /></button>
            </div>
        </aside>
    );
}

function BookingSuccess({ result, onClose }) {
    return (
        <div className="modal-backdrop">
            <section className="success-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="success-title">
                <div className="success-mark"><Icon name="check" size={26} /></div>
                <p className="eyebrow">REQUEST SENT</p>
                <h2 id="success-title">Your appointment is in motion.</h2>
                <p className="muted">The clinic received your request. You can track its status in your appointments.</p>
                <button className="button button-primary button-wide" type="button" onClick={onClose}>View my appointments <Icon name="arrow" size={17} /></button>
                {result?.appointment?.status && <span className="success-footnote">Status: {result.appointment.status}</span>}
            </section>
        </div>
    );
}

export default function App() {
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
        if (!result.token || !result.user) {
            throw new Error("The API did not return a signed-in user.");
        }
        setToken(result.token);
        setHasToken(true);
        setUser(result.user);
        setAuthMode("");
        setActiveView("overview");
        if (pendingDoctor && result.user.role === "patient") {
            setBookingDoctor(pendingDoctor);
        } else if (pendingDoctor && result.user.role !== "patient") {
            setNotice("Only patient accounts can request appointments.");
        }
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
        return <div className="full-page-loading"><span className="spinner" /> Opening your clinic workspace…</div>;
    }

    if (!user) {
        return (
            <div className="public-app">
                <PublicHeader
                    onLogin={() => setAuthMode("login")}
                    onRegister={() => setAuthMode("register")}
                    onDoctors={() => setActiveView("doctors")}
                    onHome={() => setActiveView("overview")}
                    active={activeView === "doctors" ? "doctors" : "home"}
                />
                <main>
                    {activeView === "doctors" ? (
                        <div className="public-directory-page"><DoctorDirectory search={search} setSearch={setSearch} onBook={startBooking} fullPage /></div>
                    ) : (
                        <PublicLanding
                            onLogin={() => setAuthMode("login")}
                            onRegister={() => setAuthMode("register")}
                            onBook={startBooking}
                            search={search}
                            setSearch={setSearch}
                        />
                    )}
                </main>
                {notice && <div className="toast-message" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}
                {authMode && <AuthModal mode={authMode} onClose={() => { setAuthMode(""); setPendingDoctor(null); }} onSuccess={handleAuthSuccess} />}
                {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onBooked={result => { setBookingDoctor(null); setBookingResult(result); }} />}
                {bookingResult && <BookingSuccess result={bookingResult} onClose={() => { setBookingResult(null); setHasToken(true); setActiveView("appointments"); setRefreshKey(value => value + 1); }} />}
            </div>
        );
    }

    const isAdmin = user.role === "admin";
    const isPatient = user.role === "patient";
    return (
        <div className="portal-shell">
            <SideNavigation user={user} active={activeView} onNavigate={setActiveView} onLogout={signOut} />
            <div className="portal-main">
                <header className="portal-topbar">
                    <div className="breadcrumb"><span>Carewell</span><Icon name="chevron" size={15} /><strong>{activeView === "overview" ? "Overview" : activeView === "doctors" ? "Find a doctor" : activeView === "users" ? "People" : "Appointments"}</strong></div>
                    <div className="portal-top-actions">
                        {user.role !== "admin" && (
                            <NotificationCenter onOpenAppointments={() => setActiveView(isPatient ? "appointments" : "overview")} />
                        )}
                        <span className="secure-label"><Icon name="shield" size={16} /> Secure patient portal</span>
                        <span className="top-avatar">{user.name?.[0]?.toUpperCase() || "C"}</span>
                    </div>
                </header>
                <main className="portal-content">
                    {isPatient && activeView === "doctors" ? (
                        <div className="directory-dashboard">
                            <DoctorDirectory search={search} setSearch={setSearch} onBook={startBooking} fullPage />
                        </div>
                    ) : isPatient ? (
                        <PatientDashboard user={user} refreshKey={refreshKey} onBrowseDoctors={() => setActiveView("doctors")} />
                    ) : user.role === "doctor" ? (
                        <DoctorDashboard user={user} />
                    ) : isAdmin ? (
                        <AdminDashboard user={user} section={activeView} />
                    ) : (
                        <div className="api-error"><Icon name="shield" /><div><strong>Account role unavailable</strong><p>Contact your clinic administrator to restore access.</p></div></div>
                    )}
                </main>
            </div>
            {notice && <div className="toast-message" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}
            {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode("")} onSuccess={handleAuthSuccess} />}
            {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onBooked={result => { setBookingDoctor(null); setBookingResult(result); }} />}
            {bookingResult && <BookingSuccess result={bookingResult} onClose={() => { setBookingResult(null); setActiveView("appointments"); setRefreshKey(value => value + 1); }} />}
        </div>
    );
}
