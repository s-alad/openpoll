import { useAuth } from '@/context/authcontext';
import { rdb } from '@/firebase/firebaseconfig';
import {
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { equalTo, onValue, orderByChild, query, ref, remove, update } from 'firebase/database';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import s from './answer-mc-poll.module.scss';
import Button from '@/ui/button/button';
import { MCResponses } from '@/models/poll/mc';
import { ShortResponses } from '@/models/poll/short';
import { AttendanceResponses } from '@/models/poll/attendance';

export const MCPoll = ({ poll, handleSubmit, submitMCPoll, control, user }: any) => {
    const [submitted, setSubmitted] = useState(false);
    const [showPoll, setShowPoll] = useState(true);  // Control the display of the poll

    const onSubmit = async (data: any) => {
        await submitMCPoll(data, poll.id);
        setSubmitted(true);
        setShowPoll(false);  // Hide the poll form upon submission
    };

    const handleChangeAnswers = () => {
        setShowPoll(true);  // Show the poll form again to allow answer changes
    };

    if (!showPoll) {
        // Display the submission confirmation and the change answers button
        return (
            <div>
                <p>Answers submitted.</p>
                <Button text="Change answers" onClick={handleChangeAnswers} />
            </div>
        );
    }

    return (
        <form key={poll.id} className={s.poll} onSubmit={handleSubmit(onSubmit)}>
            <h1>{poll.question}</h1>
            <div className={s.options}>
                {poll.options.map((option: any) => (
                    <div key={option.letter} className={s.option}>
                        <Controller
                            control={control}
                            name={option.letter}
                            defaultValue={poll.responses && poll.responses[option.letter] && poll.responses[option.letter][user!.uid]}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Checkbox {...field} />}
                                    label={`${option.letter}: ${option.option}`}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>
            <Button type='submit' text={submitted ? 'Resubmit' : 'Submit'} className={submitted ? s.submittedAnswerButton : s.answerButton} />
        </form>
    );
};
