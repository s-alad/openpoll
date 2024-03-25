import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';
import s from './create-poll-input.module.scss';

interface InputProps<TFieldValues extends FieldValues> {
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
    inputstyle?: "textarea" | "input";
    placeholder?: string;
    name: Path<TFieldValues>;
    register: UseFormRegister<TFieldValues>;
    options?: { value: string; label: string }[]; // Used for select inputs
    description?: string;
    defaultValue?: string | number;
    error?: string;
}

const StandardInput = <TFieldValues extends FieldValues>({
    label,
    type,
    name,
    description,
    placeholder,
    inputstyle,
    register,
    options = [],
    defaultValue,
    error,
}: InputProps<TFieldValues>) => {
    let inputElement = null;

    switch (type) {
        case 'select':
            inputElement = (
                <select {...register(name)} defaultValue={defaultValue}>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'checkbox':
            inputElement = (
                <input type="checkbox" {...register(name)} defaultChecked={!!defaultValue} />
            );
            break;
        case 'radio':
            inputElement = options.map(option => (
                <label key={option.value}>
                    <input
                        type="radio"
                        value={option.value}
                        {...register(name)}
                        defaultChecked={defaultValue === option.value}
                    />
                    {option.label}
                </label>
            ));
            break;
        default:
            inputElement = (
                inputstyle === "textarea" ?
                    <textarea
                        placeholder={placeholder}
                        {...register(name)}
                        defaultValue={defaultValue}
                    />
                    :
                    <input
                        type={type}
                        placeholder={placeholder}
                        {...register(name)}
                        defaultValue={defaultValue}
                    />
            );
    }

    return (

        <div className={s.createinput}>
            <label htmlFor={name}>{description ? description : name}:</label>
            {
                inputElement
            }
            {error && <span className={s.error}>{error}</span>}
        </div>
    );
};

export default StandardInput;