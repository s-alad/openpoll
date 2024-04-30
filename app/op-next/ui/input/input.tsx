import s from './input.module.scss';
import React, { useEffect } from 'react';
import { GenericFormField } from "@openpoll/packages/validation/form";
import { FieldValues } from 'react-hook-form';

export default function Input<T extends FieldValues>({ type, inputstyle, label, placeholder, name, register, error, disabled, defaultvalue }: GenericFormField<T>) {
    
    return (
        <div className={s.input}>
            {label && <label htmlFor={name}>{label}</label>}
            <input 
                type={type}
                placeholder={placeholder}
                {...register(name)}
            />
            {error && <span className={s.error}>{error.message}</span>}
        </div>
    )
}