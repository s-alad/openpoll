import { createclassformfield, createshortanswerformfield } from "@/validation/form";

import s from "./short-answer-input.module.scss";

interface field extends createshortanswerformfield {
    inputstyle?: "input" | "textarea"
}

export default function ShortAnswerInput({ type, inputstyle, description, placeholder, name, register, error, valueAsNumber, disabled, defaultvalue }: field) {
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
