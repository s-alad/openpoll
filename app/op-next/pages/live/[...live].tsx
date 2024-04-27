import { rdb } from "@/firebase/firebaseconfig";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { collection, doc, getDoc, query as q, updateDoc } from "firebase/firestore";
import { auth, db, fxns } from "../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import { PiChatsFill } from "react-icons/pi";
import Poll from "@/models/poll";
import MCPoll from "@/models/poll/mc";
import ShortPoll from "@/models/poll/short";
import OrderPoll from "@/models/poll/ordering";
import AttendancePoll from "@/models/poll/attendance";

export default function Live() {

    // url query
    const router = useRouter();
    const { live } = router.query;
    const classId = live ? live[0] : "";
    const pollId = live ? live[1] : "";

    const [livepoll, setLivepoll] = useState<MCPoll | ShortPoll | OrderPoll | AttendancePoll>();

    const [localpollstatus, setLocalPollStatus] = useState<boolean>(false);
    const [endedstatus, setEndedStatus] = useState<boolean>(false);
    const [showlivereponses, setShowLiveResponses] = useState<boolean>(false);
    const [showcorrectanswers, setShowCorrectAnswers] = useState<boolean>(false);

    const [responsecount, setResponseCount] = useState<number>(0);


    // gets the poll from the database on page load
    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);

        try {
            const snapshot = await get(pollsref);
            const poll = snapshot.val();
            if (!poll) return;

            const lp = poll[live![1]] as MCPoll | ShortPoll | OrderPoll | AttendancePoll;
            console.log(lp);

            if (lp.done) {
                setEndedStatus(true);
            } else { setEndedStatus(false); }

            setLivepoll(lp);

        } catch (e) { console.error("Error getting documents: ", e); }
    }

    // get the current live responses
    async function getlivereponses() {
    }

    // sets the poll status to either active or inactive
    async function setremotepollstatus(status: boolean) {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/active`);
        try { 
            await set(pollsref, status);
            setLocalPollStatus(status);
        }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    // completely ends the poll
    async function endpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/done`);
        console.log(pollsref);

        try {
            await set(pollsref, true);
            setremotepollstatus(false);
            setEndedStatus(true);

            const transferPollResultsFx = httpsCallable(fxns, "transferAndCalculatePollResults");
            const result = await transferPollResultsFx({ pollId: pollId, classId: classId });
            console.log(result.data, 'result');
        }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    // gets the poll from the database on page load
    useEffect(() => {
        if (live) {
            getpoll();
        }

    }, [live]);

    return (
        <div className={s.livepoll}>
            {
                live && livepoll ?
                    <div className={s.poll}>
                        <div className={s.info}>
                            <span className={s.question}><PiChatsFill /> {livepoll?.question}</span>
                            <span className={s.count}>
                                {`${responsecount} responses`}
                            </span>
                        </div>
                        <div className={s.polltypes}>
                            {
                                livepoll.type === "mc" &&
                                <div className={s.mc}>
                                    {
                                        (livepoll as MCPoll)?.options.map((option, index) => {
                                            return (
                                                <div key={index} className={s.option}>
                                                    <div className={s.letter}>{option.letter}</div>
                                                    <div className={s.content}>{option.option}</div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            }
                            {
                                livepoll.type === "short" && <></>
                            }
                            {
                                livepoll.type === "attendance" && (
                                    <div className={s.attendancecode}>Code: {pollId.substring(pollId.length - 4)}</div>
                                )
                            }
                        </div>

                        <div className={s.seperator}></div>

                        <div className={s.actions}>
                            <div className={s.left}>
                                {
                                    !endedstatus && (localpollstatus ?
                                        <button onClick={() => setremotepollstatus(false)} className={s.stop}>Stop</button>
                                        :
                                        <button onClick={() => setremotepollstatus(true)} className={s.start}>Start Poll</button>)
                                }
                                {
                                    endedstatus ?
                                        <div className={s.completed}>poll completed</div>
                                        :
                                        <button onClick={() => endpoll()} className={s.destructive}>Complete Poll</button>
                                }
                            </div>
                            <div className={s.right}>
                                <button onClick={() => setShowLiveResponses(!showlivereponses)} 
                                    className={`${!localpollstatus ? s.disabled : ''} ${showlivereponses ? s.off : s.on}`}
                                    disabled={!localpollstatus}
                                >
                                    {showlivereponses ? "Hide Live Responses" : "Show Live Responses"}
                                </button>
                                <button onClick={() => setShowCorrectAnswers(!showcorrectanswers)} 
                                    className={`${showcorrectanswers ? s.off : s.on}`}
                                >
                                    {showcorrectanswers ? "Hide Correct Answer" : "Show Correct Answer"}
                                </button>
                            </div>
                        </div>
                    </div>
                    :
                    ""
            }
        </div>
    )
}
