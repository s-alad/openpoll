import { rdb } from "@/firebase/firebaseconfig";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { collection, doc, getDoc, query as q, updateDoc } from "firebase/firestore";
import { auth, db, fxns } from "../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import Image from "next/image";
import PollChart from "@/components/barchart/barchart";

interface LivePoll {
    active: boolean;
    done: boolean,
    options: {
        option: string;
        letter: string;
    }[];
    type: "mc" | "short";
    question: string;
    responses?: {
        [studentid: string]: string;
    }
}

export default function Live() {

    // url query
    const router = useRouter();
    const { live } = router.query;
    const [pollId, setPollId] = useState<string>("");
    const [classId, setClassId] = useState<string>("");

    const [livepoll, setLivepoll] = useState<LivePoll>();

    const [pollstatus, setPollstatus] = useState<boolean>(false);
    const [endedstatus, setEndedStatus] = useState<boolean>(false);

    const [showAnswers, setShowAnswers] = useState<boolean>(false);
    const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);


    // Uses pollId and classId to get the correct answers from the database
    async function getCorrectAnswers(classId: string, pollId: string) {
        if (!pollId) {
            console.log('Poll ID is undefined or empty.');
            return;
        }

        // Reference to the poll document in the 'polls' collection
        const pollDocRef = doc(db, "classes", classId, "polls", pollId);
        console.log(pollDocRef, "pollDocRef")
        // Get the document from the database
        try {
            const docSnap = await getDoc(pollDocRef);

            if (docSnap.exists()) {
                const pollData = docSnap.data();
                const answers = pollData.answers;
                console.log(answers, "answers");
                setCorrectAnswers(answers);
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    }

    // gets the poll from the database on page load
    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);

        try {
            const snapshot = await get(pollsref);
            const poll = snapshot.val();
            if (!poll) return;

            const lp = poll[live![1]] as LivePoll;
            console.log(lp);

            if (lp.done) {
                setEndedStatus(true);
            } else { setEndedStatus(false); }

            setLivepoll(lp);

        } catch (e) { console.error("Error getting documents: ", e); }
    }

    // sets the poll status to either active or inactive
    async function setpollstatus(status: boolean) {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/active`);
        console.log(pollsref);

        try { await set(pollsref, status); setPollstatus(status); }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    // completely ends the poll
    async function endpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/done`);
        console.log(pollsref);

        try {
            await set(pollsref, true);
            setEndedStatus(true);
            setpollstatus(false);

            const transferPollResultsFx = httpsCallable(fxns, "transferPollResults");
            const result = await transferPollResultsFx({ pollId: pollId, classId: classId });
            console.log(result.data);
        }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    // gets the poll from the database on page load
    useEffect(() => {
        if (live) {
            console.log(live);
            setPollId(live[1] as string);
            setClassId(live[0] as string);
            getpoll();
            if (correctAnswers.length === 0) {
                getCorrectAnswers(live[0] as string, live[1] as string);
            }
        }

    }, [live]);

    return (
        <div className={s.livepoll}>
            {
                live && livepoll ?
                    <div className={s.poll}>
                        <div className={s.question}>{livepoll?.question}</div>
                        <div className={s.options}>
                            {

                                livepoll.type === "mc" &&
                                livepoll?.options.map((option, index) => {
                                    return (
                                        <div key={index} className={s.option}>
                                            <div className={s.letter}>{option.letter}</div>
                                            <div className={s.content}>{option.option}</div>
                                        </div>
                                    )
                                })
                            }
                            {
                                livepoll.type === "short" && <></>
                            }
                        </div>

                        {
                            endedstatus ?
                                <div>poll ended</div>
                                :
                                <button onClick={() => endpoll()} className={s.stop}>End Poll</button>
                        }

                        <div className={s.buttonWrapper}>


                            {
                                endedstatus ?
                                    <></>
                                    :
                                    pollstatus ?
                                        <button onClick={() => setpollstatus(false)} className={s.stop}>Stop</button>
                                        :
                                        <button onClick={() => setpollstatus(true)} className={s.start}>Start Poll</button>

                            }

                            <button onClick={() => setShowAnswers(!showAnswers)} className={s.answer}>
                                {showAnswers ? "Hide Answers" : "Show Answers"}
                            </button>
                        </div>
                    </div>
                    :
                    ""
            }

            <div className={s.answerWrapper}>
                {showAnswers && correctAnswers.length > 0 && !pollstatus && (
                    <div className={s.answers}>
                        <h2>Correct Answer</h2>
                        <p>{correctAnswers}</p>
                    </div>
                )}
                {showAnswers && correctAnswers.length > 0 && (
                    <div className={s.content}>
                        <PollChart livepoll={livepoll} />
                    </div>
                )}
                {
                    showAnswers && livepoll?.type === "short" && (
                        <div className={s.answers}>
                            <h2>Answers</h2>
                            {
                                livepoll?.responses && Object.entries(livepoll.responses).map(([studentid, answer], index) => {
                                    return (
                                        <p key={index}>{answer}</p>
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}
