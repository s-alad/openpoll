import { useAuth } from '@/context/authcontext';
import { rdb } from '@openpoll/packages/config/firebaseconfig';
import Poll, { getCorrectPollType, PollAndId } from "@openpoll/packages/models/poll";
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/button/button';
import s from '../respond-poll.module.scss';
import { ref, update } from 'firebase/database';
import AttendancePoll, { AttendanceResponses } from '@openpoll/packages/models/poll/attendance';
import { useState } from 'react';

interface RespondAttendancePollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondAttendancePoll({ classid, poll }: RespondAttendancePollProps) {

    const { user } = useAuth();
    const attendancepoll = poll.poll as AttendancePoll;

    const [loading, setLoading] = useState(false);
    const [sucess, setSuccess] = useState(false);

    async function submitAttendancePoll(data: any, pollId: string) {
        setLoading(true);
        console.log(data);

        let Ares = {
            [user!.uid]:{
                email: user!.email,
                attended: true
            }
        } as AttendanceResponses

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, Ares);
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 1000);
    }

    const { handleSubmit, control, register, formState: { errors } } = useForm({});

    return (
        <form key={poll.id} className={`${s.poll} ${s.attendance}`}
            onSubmit={handleSubmit((data) => submitAttendancePoll(data, poll.id))}
        >
            <div className={s.question}>{attendancepoll.question}</div>
            <div className={s.attendanceinput}>
                <input
                    type="text"
                    {...register("code", {
                        required: "Code is required",
                        validate: (value) => value === poll.id.slice(-4) || "non valid code"
                    })}
                    placeholder="Enter Attendance Code"
                    className={s.attendanceInput}
                />
                {errors.attendanceCode && <p className={s.errorMessage}>{"incorrect code"}</p>}
            </div>
            <Button type='submit' text='I am here' loading={loading} success={sucess} />
        </form>
    )
}