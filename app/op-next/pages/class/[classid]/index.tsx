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
import s from './class.module.scss';
import Button from '@/ui/button/button';
import { MCResponses } from '@/models/poll/mc';
import { ShortResponses } from '@/models/poll/short';
import { AttendanceResponses } from '@/models/poll/attendance';

interface LivePoll {
    id: string;
    active: boolean;
    type: "mc" | "short" | "attendance";
    options: {
        letter: string;
        option: string;
    }[],
    responses?: {
        [letter: string]: {
            [studentid: string]: [email: string];
        }
    }
    question: string;
}

export default function Class() {

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classid;
    console.log(classid, 'classid')

    const { user } = useAuth();

    const [activePolls, setActivePolls] = useState<LivePoll[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);

    useEffect(() => {
        const pollsRef = query(ref(rdb, `classes/${classid}/polls`), orderByChild('active'), equalTo(true));
        const unsubscribe = onValue(pollsRef, (snapshot) => {
            const polls = snapshot.val();
            console.log(polls);
            const activePolls = [];
            for (const id in polls) {
                if (polls[id].active) {
                    activePolls.push({ ...polls[id], id });
                }
            }
            console.log(activePolls);
            setActivePolls(activePolls);
        });

        return () => unsubscribe();
    }, [classid]);

    async function submitMCPoll(data: any, pollId: string) {
        console.log(data);

        // get the data letter that is true
        const selectedOptions = Object.keys(data).filter((key) => data[key]);
        const nonSelectedOptions = Object.keys(data).filter((key) => !data[key]);
        console.log(selectedOptions);

        let MCres = {
            email: user!.email,
            correct: false,
            response: selectedOptions
        }

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, { [user!.uid]: MCres } as MCResponses);
    }

    async function submitShortPoll(data: any, pollId: string) {
        console.log(data);

        let Sres = {
            email: user!.email,
            response: data.answer
        }

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, { [user!.uid]: Sres } as ShortResponses);
    }

    async function submitAttendancePoll(data: any, pollId: string) {

        let Ares = {
            email: user!.email,
            attended: true
        }

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, { [user!.uid]: Ares } as AttendanceResponses);
    }

    const { handleSubmit, control, register, formState: { errors } } = useForm({});

    return (
        <div className={s.class}>
            {
                classid && activePolls.length > 0 ?
                    <div className={s.openpolls}>
                        {
                            activePolls.map((poll) => {

                                if (poll.type === "mc") return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitMCPoll(data, poll.id))
                                    }>

                                        <h1>{poll.question}</h1>

                                        <div className={s.options}>
                                            {
                                                poll.options.map((option: { option: string, letter: string }) => {
                                                    return (
                                                        <div key={option.letter} className={s.option}>
                                                            <Controller
                                                                control={control}
                                                                name={option.letter}
                                                                defaultValue={
                                                                    poll.responses && poll.responses[option.letter] && user!.uid in poll.responses[option.letter]
                                                                }
                                                                render={({ field }) => (
                                                                    <FormControlLabel
                                                                        control={<Checkbox {...field}
                                                                            defaultChecked={
                                                                                poll.responses && poll.responses[option.letter] && user!.uid in poll.responses[option.letter]
                                                                            }
                                                                        />}
                                                                        label={option.letter}
                                                                    />
                                                                )}
                                                            />


                                                            <div className={s.content}>{option.option}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                        <Button type='submit' text='Submit' />
                                    </form>
                                )

                                if (poll.type === "short") return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitShortPoll(data, poll.id))
                                    }>
                                        <h1>{poll.question}</h1>

                                        <input type="text" {...control.register("answer")} className={s.shortinput}/>

                                        <Button type='submit' text='Submit' />
                                    </form>
                                )

                                if (poll.type === "attendance") return (
                                    <form key={poll.id} className={`${s.poll} ${s.attendance}`} 
                                        onSubmit={handleSubmit((data) => submitAttendancePoll(data, poll.id))}
                                    >
                                        <div className={s.question}>{poll.question}</div>
                                        <div className={s.attendanceinput}>
                                            <input
                                                type="text"
                                                {...register("attendanceCode", {
                                                    required: "Code is required",
                                                    validate: (value) => value === poll.id.slice(-4) || "Incorrect code"
                                                })}
                                                placeholder="Enter Attendance Code"
                                                className={s.attendanceInput}
                                            />
                                            {errors.attendanceCode && <p className={s.errorMessage}>{"wrong code"}</p>}
                                        </div>
                                        <Button type='submit' text='I am here' />
                                    </form>
                                );
                            })
                        }
                    </div> : <div className={s.openpolls}>no active polls</div>
            }
        </div>
    )
}