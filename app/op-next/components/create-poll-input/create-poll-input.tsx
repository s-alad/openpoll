import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface InputProps<TFieldValues extends FieldValues> {
    label: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
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
                <input
                    type={type}
                    {...register(name)}
                    defaultValue={defaultValue as string | number | undefined}
                />
            );
    }

    return (
        <div>
            <label>{label}:</label>
            {inputElement}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default StandardInput;