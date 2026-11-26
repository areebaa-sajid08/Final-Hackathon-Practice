import { useState } from "react";

const sizes = {
    card: "size-16 rounded-2xl text-lg",
    table: "size-10 rounded-xl text-xs"
};

function initials(name = "") {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

export default function ProfileAvatar({ name, imageUrl, size = "card" }) {
    const [failedUrl, setFailedUrl] = useState("");

    return (
        <span className={`relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-800 font-black text-white shadow-lg shadow-emerald-900/20 ${sizes[size] || sizes.card}`}>
            {initials(name)}
            {imageUrl && failedUrl !== imageUrl && <img className="absolute inset-0 size-full object-cover" src={imageUrl} alt={`${name || "Doctor"} profile`} onError={() => setFailedUrl(imageUrl)} />}
        </span>
    );
}
