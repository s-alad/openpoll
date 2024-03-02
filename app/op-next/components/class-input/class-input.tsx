import { formfield } from "@/models/form";

import s from "./class-input.module.scss";

interface Matchfield extends formfield {
    inputstyle?: "input" | "textarea"
}

export default function ClassInput({ type, inputstyle, description, placeholder, name, register, error, valueAsNumber, disabled, defaultvalue }: Matchfield) {
    return (
        <div className={s.classinput}>
            <label htmlFor={name}>{description ? description : name}:</label>
            {
                inputstyle === "textarea" ?
                    <textarea
                        placeholder={placeholder}
                        {...register(name, { valueAsNumber })}
                        defaultValue={defaultvalue}
                    />
                    :
                    <input
                        type={type}
                        placeholder={placeholder}
                        {...register(name, { valueAsNumber })}
                        defaultValue={defaultvalue}
                    />
            }

            {error && <span className={s.error}>{error.message}</span>}
        </div>
    )
}
