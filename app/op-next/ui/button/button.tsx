import React from "react";
import s from "./button.module.scss";

interface ButtonProps {
    onClick?: () => void;
    text: string;
    type?: "submit" | "button";
    loading?: boolean;
}

export default function Button({ onClick, text, type, loading }: ButtonProps) {
    return (
        <button className={s.button} onClick={onClick} type={type}>
            {loading ? <img src="/openpolltransparent.gif" /> : text}
        </button>
    )
}