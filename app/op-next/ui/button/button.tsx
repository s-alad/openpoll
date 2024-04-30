import React from "react";
import s from "./button.module.scss";
import { FaCheck } from "react-icons/fa";
import Spinner from "@/components/spinner/spinner";

interface ButtonProps {
    onClick?: () => void;
    text: string;
    type?: "submit" | "button";
    loading?: boolean;
    success?: boolean;
    disabled?: boolean;
}

export default function Button({ onClick, text, type, loading, success, disabled }: ButtonProps) {
    return (
        <button className={`${s.button} ${disabled && s.disabled}`} onClick={onClick} type={type} disabled={disabled}>
            {success ? <FaCheck /> : (loading ? <Spinner /> : text)}
        </button>
    )
}