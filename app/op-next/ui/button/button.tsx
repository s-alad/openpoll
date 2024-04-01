import React from "react";
import s from "./button.module.scss";

interface ButtonProps {
    onClick?: () => void;
    text: string;
    type?: "submit" | "button";
}

export default function Button({ onClick, text, type }: ButtonProps) {
    return (
        <button className={s.button} onClick={onClick} type={type}>
            {text}
        </button>
    )
}