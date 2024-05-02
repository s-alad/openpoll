import { useAuth } from '@/context/authcontext';
import { rdb } from '@openpoll/packages/config/firebaseconfig';
import Poll, { getCorrectPollType, PollAndId } from "@openpoll/packages/models/poll";
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/button/button';
import s from '../respond-poll.module.scss';
import { ref, update } from 'firebase/database';
import AttendancePoll, { AttendanceResponses } from '@openpoll/packages/models/poll/attendance';
import ShortPoll, { ShortResponses } from '@openpoll/packages/models/poll/short';
import { useState } from 'react';
import TrueFalsePoll, { TrueFalseResponses } from '@openpoll/packages/models/poll/truefalse';

import { RadioInput } from '../create-true-false-poll/create-true-false-poll';

interface RespondTrueFalsePollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondTrueFalsePoll({ classid, poll }: RespondTrueFalsePollProps) {

    const { user } = useAuth();
    const shortpoll = poll.poll as TrueFalsePoll;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function submitTrueFalsePoll(data: { [answer: string]: string }, pollId: string) {
        if (data.answer === null) return;

        console.log(data);
        setLoading(true);
        console.log(data);

        let Sres = { [user!.uid]: {
            email: user!.email,
            response: data.answer,
            correct: false
        } } as TrueFalseResponses
        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, Sres);

        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 1000);
    }

    const { handleSubmit, control, register, watch, formState: { errors } } = useForm({
        
    });
    const ischecked = watch("answer");

    return (
        <form key={poll.id} className={s.poll} onSubmit={handleSubmit((data) => submitTrueFalsePoll(data, poll.id))}>
            <h1>{shortpoll.question}</h1>
            <div className={s.tf}>
                <RadioInput
                    label="True"
                    value="true"
                    name="answer"
                    register={register}
                    defaultChecked={ischecked === "true"}
                />
                <RadioInput
                    label="False"
                    value="false"
                    name="answer"
                    register={register}
                    defaultChecked={ischecked === "false"}
                />
            </div>
            <Button type='submit' text='Submit' loading={loading} success={success} />
        </form>
    )
}