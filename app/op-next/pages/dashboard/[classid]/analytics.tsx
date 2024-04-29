import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';
import Poll, { getCorrectPollType, xPoll } from "@/models/poll";
import RenderBarChart from '@/components/barchart/barchart';
import { useAuth } from '@/context/authcontext';
import { onAuthStateChanged } from 'firebase/auth';
import s from './analytics.module.scss'
import MCPoll from "@/models/poll/mc";
import AttendancePoll from "@/models/poll/attendance";
import MatchPoll from "@/models/poll/matching";
import OrderPoll from "@/models/poll/ordering";
import ShortPoll from "@/models/poll/short";

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;
    const { user } = useAuth();

    const [openpolls, setOpenpolls] = useState<(MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll)[]>([]);
    const [loading, setLoading] = useState(true);

    async function getpolls() {

        const classref = doc(db, "classes", classid as string);
        const pollsref = collection(classref, "polls");

        try {
            const donePollsQuery = query(pollsref, where("done", "==", true));
            const snapshot = await getDocs(donePollsQuery);
            let donePolls: (MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll)[] = [];

            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data();
                const poll = getCorrectPollType(data);
                if (!poll) return;
                donePolls.push(poll);
            });

            setOpenpolls(donePolls);
            setLoading(false);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }

    function filterpolls(polls: (MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll)[]): (MCPoll)[] {
        return polls.filter((poll) => poll.type === "mc") as (MCPoll)[];
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && classid) {
                getpolls();
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
                    {/* {

                        openpolls.map((data, index) => (
                            <div className={s.pollContainer}>
                                <div className={s.pollQuestion}>{index + 1}. {data.question}</div>
                                <div>Correct Answers: {data.answerkey}</div>

                                <RenderBarChart poll={data} key={index} />
                            </div>
                        ))} */}
                        {
                            filterpolls(openpolls).map((data, index) => (
                                <div className={s.pollContainer}>
                                    <div className={s.pollQuestion}>{index + 1}. {data.question}</div>
                                    <div>Correct Answers: {data.answerkey}</div>
                                    <RenderBarChart poll={data} key={index} />
                                </div>
                            ))
                        }
                </div>
            )}
        </div>
    );
}