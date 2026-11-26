import { useState } from "react";
import Icon from "./Icon.jsx";

export default function PasswordInput(props) {
    const [visible, setVisible] = useState(false);

    return (
        <span className="relative block">
            <input {...props} className={`w-full rounded-xl border border-emerald-950/10 bg-white/80 px-4 py-3 pr-12 text-sm text-emerald-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${props.className || ""}`} type={visible ? "text" : "password"} />
            <button
                className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-emerald-800/60 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible(current => !current)}
            >
                <Icon name={visible ? "eyeOff" : "eye"} size={17} />
            </button>
        </span>
    );
}
