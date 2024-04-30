import { rdb } from "@/firebase/firebaseconfig";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { collection, doc, getDoc, query as q, updateDoc } from "firebase/firestore";
import { auth, db, fxns } from "../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import { PiChatsFill } from "react-icons/pi";
import Poll, { getCorrectPollType } from "@openpoll/packages/models/poll";
import MCPoll, { MCResponses } from "@openpoll/packages/models/poll/mc";
import ShortPoll, { ShortResponses } from "@openpoll/packages/models/poll/short";
import OrderPoll, { OrderResponses } from "@openpoll/packages/models/poll/ordering";
import AttendancePoll, { AttendanceResponses } from "@openpoll/packages/models/poll/attendance";
import { getPollTypeFromId } from "@/context/utils";
import LiveMcResponses from "@/components/live-responses/mc-responses";
import { FaCheck } from "react-icons/fa";
import LiveShortResponses from "@/components/live-responses/short-responses";
import Spinner from "@/components/spinner/spinner";

export default function Live() {

    // url query
    const router = useRouter();
    const { live } = router.query;
    const classId = live ? live[0] : "";
    const pollId = live ? live[1] : "";

    const [livepoll, setLivepoll] = useState<MCPoll | ShortPoll | OrderPoll | AttendancePoll>();

    const [localpollstatus, setLocalPollStatus] = useState<boolean>(false);
    const [endedstatus, setEndedStatus] = useState<boolean>(false);
    const [ending, setEnding] = useState<boolean>(false);
    const [showlivereponses, setShowLiveResponses] = useState<boolean>(false);
    const [showcorrectanswers, setShowCorrectAnswers] = useState<boolean>(false);

    const isshortwithnokey = livepoll?.type === "short" && !(livepoll as ShortPoll).answerkey;

    const [responses, setResponses] = useState<(MCResponses | ShortResponses | OrderResponses | AttendanceResponses | null)>();


    // gets the poll from the realtime database on page load
    async function getpoll() {
        if (!classId || !pollId) return;

        const pollref = ref(rdb, `classes/${classId}/polls/${pollId}`);
        try {
            const snapshot = await get(pollref);
            const lp = snapshot.val();
            if (!lp) return;

            if (lp.done) { setEndedStatus(true); }
            else { setEndedStatus(false); }

            if (lp.active) { setLocalPollStatus(true); }
            else { setLocalPollStatus(false); }

            const polltype = lp.type;

            switch (polltype) {
                case "mc":
                    setLivepoll(getCorrectPollType(lp) as MCPoll);
                    break;
                case "short":
                    setLivepoll(getCorrectPollType(lp) as ShortPoll);
                    break;
                case "order":
                    setLivepoll(getCorrectPollType(lp) as OrderPoll);
                    break;
                case "attendance":
                    setLivepoll(getCorrectPollType(lp) as AttendancePoll);
                    break;
                default:
                    break;
            }
        } catch (e) { console.error("Error getting documents: ", e); }
    }

    // get the current live responses
    async function getlivereponses() {
        console.log("getting live responses");
        if (!classId || !pollId) return;

        const polltype = await getPollTypeFromId(classId, pollId);

        const responsesref = ref(rdb, `classes/${classId}/polls/${pollId}/responses`);
        try {
            onValue(responsesref, (snapshot) => {
                const responses = snapshot.val();
                console.log("responses: ", responses);
                if (responses) {
                    console.log("responses: ", responses);

                    switch (polltype) {
                        case "mc":
                            console.log("mc");
                            console.log(responses);
                            setResponses(responses as MCResponses);
                            break;
                        case "short":
                            setResponses(responses as ShortResponses);
                            break;
                        case "order":
                            setResponses(responses as OrderResponses);
                            break;
                        case "attendance":
                            setResponses(responses as AttendanceResponses);
                            break;
                        default:
                            break;
                    }

                } else {
                    setResponses(null);
                }
            }, (error) => {
                console.error("Error listening to live responses: ", error);
            });

        } catch (e) { console.error("Error getting documents: ", e); }
    }

    // sets the poll status to either active or inactive
    async function setremotepollstatus(status: boolean) {
        if (!classId || !pollId) return;

        const pollsref = ref(rdb, `classes/${classId}/polls/${pollId}/active`);
        try {
            await set(pollsref, status);
            setLocalPollStatus(status);
        }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    // completely ends the poll
    async function endpoll() {
        if (!classId || !pollId) return;
        setEnding(true);
        try {

            const transferPollResultsFx = httpsCallable(fxns, "transferAndCalculatePollResults");
            const result = await transferPollResultsFx({ pollId: pollId, classId: classId });
            const pollsref = ref(rdb, `classes/${classId}/polls/${pollId}/done`);
            await set(pollsref, true);
            setremotepollstatus(false);
            setEnding(false);
            setEndedStatus(true);
            console.log(result.data, 'result');
        }
        catch (e) { console.error("Error getting documents: ", e); }
        setEnding(false);
    }

    function uniqueInnerResponsesOrderPoll(responses: OrderResponses) {
        let uniqueset = new Set();
        let unique: {
            letter: string;
            option: string;
        }[][] = [];
        let count: { [key: string]: number } = {};

        Object.values(responses).forEach(response => {
            let insideresponse = Object.values(response.response);
            let stringresponse = JSON.stringify(insideresponse);
            if (!uniqueset.has(stringresponse)) {
                uniqueset.add(stringresponse);
                unique.push(insideresponse);
                count[stringresponse] = 1;
            }
            else {
                count[stringresponse] += 1;
            }
        });

        return {unique, count}
    }

    // gets the poll from the database on page load
    useEffect(() => {
        if (live) {
            getpoll();
            getlivereponses();
        }

    }, [live]);

    return (
        <div className={s.livepoll}>
            {
                live && livepoll &&
                <div className={s.poll}>
                    <div className={s.info}>
                        <span className={s.question}><PiChatsFill /> {livepoll?.question}</span>
                        <span className={s.count}>
                            {`${responses ? Object.keys(responses).length : 0} responses`}
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
                        {
                            livepoll.type === "order" &&
                            <div className={s.order}>
                                {
                                    (livepoll as OrderPoll)?.options.map((option, index) => {
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
                    </div>

                    <div className={s.seperator}></div>

                    <div className={s.actions}>
                        <div className={s.left}>
                            {
                                (!endedstatus && !ending) && (localpollstatus ?
                                    <button onClick={() => setremotepollstatus(false)} className={s.stop}>Stop</button>
                                    :
                                    <button onClick={() => setremotepollstatus(true)} className={s.start}>Start Poll</button>)
                            }
                            {
                                ending && <div className={s.loading}><Spinner op={false}/></div>
                            }
                            {
                                endedstatus ?
                                    <div className={s.completed}>poll completed</div>
                                    :
                                    <button onClick={() => endpoll()} className={s.destructive}>Complete Poll</button>
                            }
                        </div>
                        {
                            livepoll.type !== "attendance" && (
                                <div className={s.right}>
                                    <button onClick={() => {
                                        if (!showlivereponses) {setShowLiveResponses(true)}
                                        else {setShowLiveResponses(false); setShowCorrectAnswers(false)}

                                        console.log("showlivereponses: ", showlivereponses);
                                        console.log("showcorrectanswers: ", showcorrectanswers);
                                        console.log("livepoll: ", livepoll);
                                        console.log("ak: ", (livepoll as OrderPoll).answerkey);
                                    }}
                                        /* className={`${!localpollstatus ? s.disabled : ''} ${showlivereponses ? s.off : s.on}`} */
                                        /* disabled={!localpollstatus} */
                                        className={`${showlivereponses ? s.off : s.on}`}
                                    >
                                        {showlivereponses ? "Hide Live Responses" : "Show Live Responses"}
                                    </button>
                                    <button onClick={() => setShowCorrectAnswers(!showcorrectanswers)}
                                        className={`${(!showlivereponses || isshortwithnokey) ? s.disabled : ''} ${showcorrectanswers ? s.off : s.on}`}
                                    >
                                        {showcorrectanswers ? "Hide Correct Answer" : "Show Correct Answer"}
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            }
            <div className={s.liveresponses}>
                {
                    showlivereponses && !responses && (
                        <div className={s.none}>no live responses yet</div>
                    )
                }
                {
                    livepoll && livepoll.type === "mc" && showlivereponses && responses && (
                        <LiveMcResponses 
                            livepoll={livepoll as MCPoll} 
                            responses={responses as MCResponses} 
                            showcorrectanswers={showcorrectanswers} 
                        />
                    )
                }
                {
                    livepoll && livepoll.type === "short" && showlivereponses && responses && (
                        <LiveShortResponses 
                            livepoll={livepoll as ShortPoll} 
                            responses={responses as ShortResponses} 
                            showcorrectanswers={showcorrectanswers}
                        />
                    )
                }
                {
                    livepoll && livepoll.type === "order" && showlivereponses && responses && (
                        <div className={s.orderresponses}>
                            {
                                showcorrectanswers && (livepoll as OrderPoll).answerkey && (
                                    <div className={s.correct}>
                                        {
                                            Object.values((livepoll as OrderPoll).answerkey).map((answer, index) => {
                                                return (
                                                    <div key={index} className={s.response}>
                                                        <div className={s.letter}>{answer.letter}</div>
                                                        <div className={s.content}>{answer.option}</div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                            {
                                uniqueInnerResponsesOrderPoll(responses as OrderResponses).unique.map((response, index) => {
                                    return (
                                        <div key={index} className={s.response}>
                                            <div className={s.count}>
                                                {uniqueInnerResponsesOrderPoll(responses as OrderResponses).count[JSON.stringify(response)]}
                                            </div>
                                            {
                                                response.map((option, index) => {
                                                    return (
                                                        <div key={index} className={s.option}>
                                                            <div className={s.letter}>{option.letter}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
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
