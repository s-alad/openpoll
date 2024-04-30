import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@openpoll/packages/config/firebaseconfig';
import MCPoll from "@openpoll/packages/models/poll/mc";
import ShortPoll from "@openpoll/packages/models/poll/short";
import RenderBarChart from "@/components/barchart/barchart";
import s from "./analytics.poll.module.scss"

function RenderMCAnalytics({ poll }: { poll: MCPoll }) {
    return (
        <div className={s.PollContainer}>
            <div className={s.pollQuestion}>{poll.question}</div>
            <div className={s.pollAnswer}>Answer: {poll.answerkey}</div>

            {/* Bar Chart */}
            <RenderBarChart poll={poll}/>
            
            {/* Student Stats */}
            <table className={s.pollTable}>
                <tr className={s.pollTableHeader}>
                    <th>Email</th>
                    <th>Response</th>
                </tr>

                {
                    Object.values(poll.responses).map((data, index) => (
                        <tr className={data.correct ? s.correctRow : s.incorrectRow} key={index}>
                            <th>{data.email}</th>
                            <th>{data.response}</th>
                        </tr>
                    ))
                }

            </table>
        </div>
    )
}

function RenderShortAnalytics({ poll }: { poll: ShortPoll }) {
    return (
        <div className={s.PollContainer}>
            <div className={s.pollQuestion}>{poll.question}</div>
            <div className={s.pollAnswer}>Answer: {poll.answerkey}</div>
            
            {/* Student Stats */}
            <table className={s.pollTable}>
                <tr className={s.pollTableHeader}>
                    <th>Email</th>
                    <th>Response</th>
                </tr>

                {
                    Object.values(poll.responses).map((data, index) => (
                        <tr className={data.correct ? s.correctRow : s.incorrectRow} key={index}>
                            <th>{data.email}</th>
                            <th>{data.response}</th>
                        </tr>
                    ))
                }

            </table>
        </div>
    )
}

export default function AdvancedAnalytics() {
    const router = useRouter()
    const { pollid, classid } = router.query;
    const [pollData, setPollData] = useState<MCPoll | ShortPoll | null>(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPollData() {
            if (classid && pollid) {
                const pollRef = doc(db, `classes/${classid}/polls/${pollid}`);
                const docSnap = await getDoc(pollRef);
                const data = docSnap.data() as (MCPoll | ShortPoll);

                if (docSnap.exists()) {
                    setPollData(data)
                    setLoading(false);
                }
            }
        }

        fetchPollData();
    }, [classid, pollid])

    if (loading) return <div>Loading...</div>;
    if (!pollData) return <div>No poll data available</div>;

    return (
        <main>
            <div className={s.AdvancedAnalytics}>
                {
                    pollData.type === "mc" && <RenderMCAnalytics poll={pollData as MCPoll} />
                }
                {
                    pollData.type === "short" && <RenderShortAnalytics poll={pollData as ShortPoll}/>
                }
            </div>
        </main>
    )
}
