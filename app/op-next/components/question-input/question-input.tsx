import { createpollformfield } from "@/validation/form";

import s from "./question-input.module.scss";

interface field extends createpollformfield {
    inputstyle?: "input" | "textarea"
}

export default function QuestionInput({ type, inputstyle, description, placeholder, name, register, error, valueAsNumber, disabled, defaultvalue }: field) {
    return (
        <div className={s.questioninput}>
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
