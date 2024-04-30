import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@openpoll/packages/config/firebaseconfig';
import Poll, { getCorrectPollType, xPoll } from "@openpoll/packages/models/poll";
import RenderBarChart from '@/components/barchart/barchart';
import { useAuth } from '@/context/authcontext';
import { onAuthStateChanged } from 'firebase/auth';
import { getClassnameFromId } from "@openpoll/packages/models/class";
import Link from "next/link";
import s from './analytics.module.scss'
import MCPoll from "@openpoll/packages/models/poll/mc";
import AttendancePoll from "@openpoll/packages/models/poll/attendance";
import MatchPoll from "@openpoll/packages/models/poll/matching";
import OrderPoll from "@openpoll/packages/models/poll/ordering";
import ShortPoll from "@openpoll/packages/models/poll/short";

type PollType = MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll

type pollMap = Record<string, PollType>;

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;
    const { user } = useAuth();

    const [openpolls, setOpenpolls] = useState<pollMap>({});
    const [loading, setLoading] = useState(true);
    const [classname, setClassname] = useState<string>("");

    async function getpolls() {

        const classref = doc(db, "classes", classid as string);
        const pollsref = collection(classref, "polls");

        try {
            const donePollsQuery = query(pollsref, where("done", "==", true));
            const snapshot = await getDocs(donePollsQuery);
            let donePolls: pollMap = {};

            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data();
                const poll = getCorrectPollType(data);
                if (!poll) return;
                donePolls[pid] = poll;
            });

            setOpenpolls(donePolls);
            setLoading(false);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }

    function filterMCPolls(polls: pollMap): Record<string, MCPoll> {
        const filteredPolls: Record<string, MCPoll> = {}

        for (const key in polls) {
            if (polls[key].type == "mc") {
                filteredPolls[key] = polls[key] as MCPoll;
            }
        }

        return filteredPolls;
    }

    function filterShortPolls(polls: pollMap): Record<string, ShortPoll> {
        const filteredPolls: Record<string, ShortPoll> = {}

        for (const key in polls) {
            if (polls[key].type == "short") {
                filteredPolls[key] = polls[key] as ShortPoll;
            }
        }

        return filteredPolls
    }
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && classid) {
                getpolls();
                const className = getClassnameFromId(classid as string);
                className.then((name) => setClassname(name))
            }
        });

        return () => unsubscribe();
    }, [classid]);

    return (
        <div className={s.class}>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <div className={s.analyticsHeader}>
                        <div>Analytics for {classname}</div>
                    </div>
                    {
                        Object.entries(filterMCPolls(openpolls)).map(([key, data], index) => (
                            <div className={s.pollContainer}>
                                <div className={s.pollQuestion}>
                                    <Link href={{pathname: `/dashboard/${classid}/analytics/${key}`}}>
                                        {index + 1}. {data.question}
                                    </Link>
                                </div>
                                <div>Correct Answers: {data.answerkey}</div>
                                <RenderBarChart poll={data} key={index} />
                            </div>
                        ))
                    }

                    {
                        Object.entries(filterShortPolls(openpolls)).map(([key, data], index) => (
                            <div className={s.pollContainer} key={index}>
                                <div className={s.pollQuestion}>
                                    <Link href={{pathname: `/dashboard/${classid}/analytics/${key}`}}>
                                        {index + 1}. {data.question}
                                    </Link>
                                </div>
                                <div>Correct Answers: {data.answerkey}</div>

                                <table className={s.shortAnswerTable}>
                                    <tr className={s.tableHeader}>
                                        <th>Email</th>
                                        <th>Response</th>
                                    </tr>

                                    {
                                        Object.values(data.responses).map((response, index) => (
                                            <tr className={response.correct ? s.correctRow : s.incorrectRow} key={index}>
                                                <th>{response.email}</th>
                                                <th>{response.response}</th>
                                            </tr>
                                        ))
                                    }

                                </table>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}
