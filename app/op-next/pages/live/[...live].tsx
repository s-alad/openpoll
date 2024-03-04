import { rdb } from "@/firebase/firebaseconfig";
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import s from './live.module.scss';

interface LivePoll {
    active: boolean;
    options: {
        option: string;
        letter: string;
    }[];
    question: string;
    responses?: {
        [letter: string]: {
            [studentid: string]: string;
        }
    }
}

export default function Live() {

    const router = useRouter();
    const { live } = router.query;

    const [livepoll, setLivepoll] = useState<LivePoll>();
    const [pollstatus, setPollstatus] = useState<boolean>(false);

    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);
        console.log(pollsref);

        try {
            const snapshot = await get(pollsref);
            const poll = snapshot.val();
            if (!poll) return;

            const lp = poll[live![1]] as LivePoll;
            console.log(lp);

            setLivepoll(lp);
        } catch (e) { console.error("Error getting documents: ", e); }
    }

    async function setpollstatus(status: boolean) {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/active`);
        console.log(pollsref);

        try { await set(pollsref, status); setPollstatus(status); }
        catch (e) { console.error("Error getting documents: ", e); }
    }


    //wait until router is loaded
    useEffect(() => {
        if (live) {
            console.log(live);
            getpoll();
        }
    }, [live]);


    useEffect(() => {
        const pollsRef = ref(rdb, `classes/${live![0]}/polls/${live![1]}`);
        const unsubscribe = onValue(pollsRef, (snapshot) => {
            const polls = snapshot.val();
            console.log(polls);
            setLivepoll(polls);
        });

        return () => unsubscribe();
    }, [live]);

    return (
        <div className={s.livepoll}>
            {
                live ?
                    <div className={s.poll}>
                        <div className={s.question}>{livepoll?.question}</div>
                        <div className={s.options}>
                            {
                                livepoll?.options.map((option, index) => {
                                    return (
                                        <div key={index} className={s.option}>
                                            <div className={s.letter}>{option.letter}</div>
                                            <div className={s.content}>{option.option}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {
                            pollstatus ?
                                <button onClick={() => setpollstatus(false)} className={s.stop}>Stop</button>
                                :
                                <button onClick={() => setpollstatus(true)} className={s.start}>Start Poll</button>
                        }
                    </div>
                    :
                    ""
            }
            <div className={s.live}>
                {
                    livepoll && livepoll.options.map((option, index) => {
                        return (
                            <div key={index} className={s.response}>
                                <div>{option.letter}: </div>
                                {
                                    livepoll.responses ?
                                        <div>
                                            {
                                                livepoll.responses[option.letter] ?
                                                    Object.keys(livepoll.responses[option.letter]).length
                                                    :
                                                    0
                                            }
                                        </div>
                                        :
                                        "   0"
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}