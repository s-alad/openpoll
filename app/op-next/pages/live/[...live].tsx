import { rdb } from "@/firebase/firebaseconfig";
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { collection, doc, getDoc, query as q, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import { BarChart } from '@mui/x-charts'
import { axisClasses } from '@mui/x-charts';
import Image from "next/image";
import PollChart from "@/components/barchart/barchart";

interface LivePoll {
    active: boolean;
    options: {
        option: string;
        letter: string;
    }[];
    question: string;
    responses?: {
        [studentid: string]: string;
    }
}

export default function Live() {

    const router = useRouter();
    const { live } = router.query;

    const [livepoll, setLivepoll] = useState<LivePoll>();
    const [pollstatus, setPollstatus] = useState<boolean>(false);
    const [pollId, setPollId] = useState<string>("");
    const [correctAnswers, setCorrectAnswers] = useState<string>("");
    const [classId, setClassId] = useState<string>("");
    const [showAnswers, setShowAnswers] = useState<boolean>(false);

    // Uses pollId and classId to get the correct answers from the database
    async function getCorrectAnswers(pollId: any) {
        // Make sure that 'pollId' is not empty
        if (!pollId) {
            console.log('Poll ID is undefined or empty.');
            return;
        }
    
        // Reference to the poll document in the 'polls' collection
        const pollDocRef = doc(db, "classes", classId,  "polls", pollId);
        console.log(pollDocRef, "pollDocRef")
        // Get the document from the database
        try {
            const docSnap = await getDoc(pollDocRef);
    
            if (docSnap.exists()) {
                const pollData = docSnap.data();
                const answers = pollData.answers;
                console.log(answers, "answers");
                setCorrectAnswers(answers[0]);
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    }

    const handleShowAnswers = async () => {
        // Only fetch answers if they haven't been fetched already
        if (correctAnswers.length === 0) {
            await getCorrectAnswers(pollId);
        }
        // Toggle the visibility of the answers
        setShowAnswers(prev => !prev);
    };

    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);
        console.log(pollsref, "pollsref");

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
            setPollId(live[1] as string);
            setClassId(live[0] as string);
            getpoll();
        }
    }, [live]);

    useEffect(() => {
        // Need live to be an array and have a length greater than 1
        if (Array.isArray(live) && live.length > 1) {
            const pollsRef = ref(rdb, `classes/${live[0]}/polls/${live[1]}`);
            const unsubscribe = onValue(pollsRef, (snapshot) => {
                const polls = snapshot.val();
                console.log(polls, "polls");
                setLivepoll(polls);
            });

            return () => unsubscribe();
        }
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
                        <div className={s.buttonWrapper}>
                            

                            {
                                pollstatus ?
                                    <button onClick={() => setpollstatus(false)} className={s.stop}>Stop</button>
                                    :
                                    <button onClick={() => setpollstatus(true)} className={s.start}>Start Poll</button>
                            }
                            
                            <button onClick={handleShowAnswers} className={s.answer}>
                                {showAnswers ? "Hide Answers" : "Show Answers"}
                            </button>
                        </div>
                        
                    </div>
                    :
                    ""
            }  
            <div className={s.answerWrapper}>
                <div>
                    {showAnswers && correctAnswers.length > 0 && (
                        <div className={s.answers}>
                            <h2>Correct Answer</h2>
                            <p>{correctAnswers}</p>
                        </div>
                    )}
                </div>
                {showAnswers && livepoll  && (
                    <div className={s.content}>
                        <PollChart livepoll={livepoll} />
                    </div>
                )}
            </div>

            {/* Live Poll response section */}
            {/* If the poll is live (Start poll) then we only show how many have responded and after we stop the poll we show the disparity of answers like bar/pie graph */}

            <div className={s.live}>
                {livepoll && livepoll.active && (
                    <div className={s.response}> 
                        {
                            livepoll.responses ?
                            // Creates a new Set to hold unique student IDs
                            new Set(
                                // Get an array of all student objects
                                Object.values(livepoll.responses)
                                // Flatten the array of student objects into an array of student IDs
                                .flatMap(response => Object.keys(response))
                            ).size
                            :
                            0
                        }
                        {"  "}
                        Answered
                    </div>

                )}
            </div>
        </div>
    )
}
