import React from "react";
import s from "./button.module.scss";

interface ButtonProps {
    onClick?: () => void;
    text: string;
    type?: "submit" | "button";
    className?: string;  // Add this line for optional custom class

}

export default function Button({ onClick, text, type, className }: ButtonProps) {

    const buttonClass = `${s.button} ${className || ''}`;


    return (
        <button className={buttonClass} onClick={onClick} type={type}>
            {text}
        </button>
    )
}