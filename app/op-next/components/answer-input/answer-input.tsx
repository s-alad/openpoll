import { createpollformfield } from "@/models/form";

import s from "./answer-input.module.scss";

interface answerfield extends createpollformfield {
    index: number;
}

export default function AnswerInput({ type, index, description, placeholder, name, register, error, valueAsNumber, disabled, defaultvalue }: answerfield) {
    return (
        <div className={s.questioninput}>
            {/* <label htmlFor={name}>{description ? description : name}:</label> */}

            <input
                type={type}
                placeholder={placeholder}
                {...register(`options.${index}.option` as const)}
                defaultValue={defaultvalue}
            />

            {error && <span className={s.error}>{error.message}</span>}
        </div>
    )
}
