import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PollV, pollSchema } from '@/validation/poll-schema';
import StandardInput from '../create-poll-input/create-poll-input';
import s from './create-poll-form.module.scss';
import QuestionInput from '../question-input/question-input';

export function TestForm() {

    /*     type polltypes = "mc" | "short";
        const [polltype, setpolltype] = useState<polltypes>("mc"); */


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PollV>({
        resolver: zodResolver(pollSchema),
        defaultValues: {
            type: "shortAnswer",
            question: "",
        },
    });

    const pollType = watch("type");

    const onSubmit = (data: PollV) => {
        console.log(data);
    };

    const selectPollType = (type: "shortAnswer" | "multipleChoice") => {
        setValue("type", type, { shouldValidate: true }); // Set the value and trigger validation
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={s.create}>

            <div className={s.selector} {...register("type")}>
                {
                    ["shortAnswer", "multipleChoice"].map((type) => {
                        return (
                            <option
                                value={type}
                                className={`${s.type} ${pollType === type ? s.active : ""}`}
                                key={type}
                                onClick={() => selectPollType(type as "shortAnswer" | "multipleChoice")}
                            >
                                {type}
                            </option>
                        )
                    })
                }
            </div>
            <StandardInput
                type="text"
                label='Your Label'
                placeholder="Enter your question"
                register={register}
                name="question"
                error={errors.question?.message}
                description="Question"
            />

            {
                pollType === "shortAnswer" && (
                    <StandardInput
                        label="Your Label"
                        type="text"
                        name="answers"
                        register={register}
                        error={errors.answers?.message}
                        />
                    )
            }

            {
                pollType === "multipleChoice" && (
                    <StandardInput
                        label="Your Label"
                        type="text"
                        name="answers"
                        register={register}
                        error={errors.answers?.message}
                    />
                )
            }

            <input type="submit" />
        </form>
    );
};
