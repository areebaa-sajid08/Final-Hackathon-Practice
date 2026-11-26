import { useState } from "react";
import Icon from "./Icon.jsx";

export default function PasswordInput(props) {
    const [visible, setVisible] = useState(false);

    return (
        <span className="password-input-wrap">
            <input {...props} type={visible ? "text" : "password"} />
            <button
                className="password-visibility-toggle"
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
