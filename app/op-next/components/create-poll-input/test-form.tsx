import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PollV, pollSchema } from '@/validation/poll-schema';
import StandardInput from './create-poll-input';

export function TestForm() {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PollV>({
        resolver: zodResolver(pollSchema),
    });

    const pollType = watch("type"); 

    const onSubmit = (data: PollV) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <StandardInput
                label="Your Label"
                type="text"
                name="type"
                register={register}
                error={errors.type?.message}
            />
            {
                pollType === "multipleChoice" && (
                    <StandardInput
                        label="Your Label"
                        type="text"
                        name="question"
                        register={register}
                        error={errors.question?.message}
                    />
                )
            }
            {
                pollType === "shortAnswer" && (
                    <StandardInput
                        label="Your Label"
                        type="text"
                        name="question"
                        register={register}
                        error={errors.question?.message}
                    />
                )
            }
            <StandardInput 
                label="Your Label" 
                type="text" 
                name="question" 
                register={register} 
                error={errors.question?.message}
                />

            <input type="submit" />
        </form>
    );
};
