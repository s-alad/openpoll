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

interface RespondShortPollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondShortPoll({ classid, poll }: RespondShortPollProps) {

    const { user } = useAuth();
    const shortpoll = poll.poll as ShortPoll;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function submitShortPoll(data: { [answer: string]: string }, pollId: string) {
        setLoading(true);
        console.log(data);

        let Sres = { [user!.uid]: {
            email: user!.email,
            response: data.answer
        } } as ShortResponses

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, Sres);

        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 1000);
    }

    const { handleSubmit, control, register, formState: { errors } } = useForm({});

    return (
        <form key={poll.id} className={s.poll} onSubmit={handleSubmit((data) => submitShortPoll(data, poll.id))}>
            <h1>{shortpoll.question}</h1>
            <input type="text" {...control.register("answer")} className={s.shortinput} />
            <Button type='submit' text='Submit' loading={loading} success={success} />
        </form>
    )
}