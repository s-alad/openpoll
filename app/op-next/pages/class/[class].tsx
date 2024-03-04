import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './class.module.scss';
import Link from 'next/link';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from '@/models/poll';
import { rdb } from '@/firebase/firebaseconfig'; import { equalTo, onValue, orderByChild, query, ref } from 'firebase/database';
import {
    Box,
    Checkbox,
    FormControlLabel,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@/context/authcontext';
import { update } from 'firebase/database';
import { remove } from 'firebase/database';

interface LivePoll {
    id: string;
    active: boolean;
    options: {
        letter: string;
        option: string;
    }[]
    question: string;
}

export default function Class() {

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classid;

    const { user } = useAuth();

    const [activePolls, setActivePolls] = useState<LivePoll[]>([]);


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

    async function submitPoll(data: any, pollId: string) {
        console.log(data);
        
        // get the data letter that is true
        const selectedOptions = Object.keys(data).filter((key) => data[key]);
        const nonSelectedOptions = Object.keys(data).filter((key) => !data[key]);
        console.log(selectedOptions);

        // add student to selected options
        for (const letter of selectedOptions) {
            const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses/${letter}/students`);
            await update(answerRef, { [user!.uid]: user!.email });
        }

        // remove student from non selected options
        for (const letter of nonSelectedOptions) {
            const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses/${letter}/students/${user!.uid}`);
            await remove(answerRef);
        }



    }

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
    });


    return (
        <div className={s.class}>
            {
                classid && activePolls.length > 0 ?
                    <div className={s.openpolls}>
                        {
                            activePolls.map((poll) => {
                                return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitPoll(data, poll.id))
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
                                                                    render={({ field }) => (
                                                                        <FormControlLabel
                                                                            control={<Checkbox {...field} />}
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
                                        <button type="submit">Submit</button>
                                    </form>
                                )
                            })
                        }
                    </div> : 'no active polls'
            }
        </div>
    )
}