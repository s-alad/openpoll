import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '@openpoll/packages/config/firebaseconfig';
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateOrderingPoll from '@/forms/create-ordering-poll/create-ordering-poll';
import s from './edit.poll.module.scss';
import Poll, {  } from '@openpoll/packages/models/poll';
import MCPoll from "@openpoll/packages/models/poll/mc";
import ShortPoll from "@openpoll/packages/models/poll/short";
import CreateTrueFalsePoll from "@/forms/create-true-false-poll/create-true-false-poll";
import TrueFalsePoll from "@openpoll/packages/models/poll/truefalse";
import OrderPoll from "@openpoll/packages/models/poll/ordering";

export default function EditPoll() {
    const router = useRouter();
    const { pollid, classid } = router.query;
    const [pollData, setPollData] = useState<MCPoll | ShortPoll | TrueFalsePoll | OrderPoll | null>(null);
    const [loading, setLoading] = useState(true);

    function ensureArray(input: any) {
        // Check if input is already an array
        if (Array.isArray(input)) {
            return input;
        }
        // Check if the input is a string
        else if (typeof input === 'string') {
            return [input];  // Return an array containing the string
        }
        // Optional: Handle cases where input is neither a string nor an array
        else {
            return [];  // Return an empty array or throw an error as per your needs
        }
    }

    useEffect(() => {
        async function fetchPollData() {
            if (classid && pollid) {
                const pollRef = doc(db, `classes/${classid}/polls/${pollid}`);
                const docSnap = await getDoc(pollRef);
                const data = docSnap.data() as (MCPoll | ShortPoll);
                const pid = docSnap.id;

                if (docSnap.exists()) {
                    setPollData(data);
                    setLoading(false);
                } else {
                    console.log("No such poll!");
                    setLoading(false);
                }
            }
        }

        fetchPollData();
    }, [classid, pollid]);

    console.log(pollData)

    if (loading) return <div>Loading...</div>;
    if (!pollData) return <div>No poll data available</div>;





    return (
        <main className={s.editpoll}>
            <div className={s.edit}>
                {
					pollData.type === "mc" && <CreateMultipleChoicePoll pollData={pollData as MCPoll} pollid={pollid as string}/>
				}
                {
					pollData.type === "short" && <CreateShortAnswerPoll pollData={pollData as ShortPoll} pollid={pollid as string}/>
				}
                {
					pollData.type === "tf" && <CreateTrueFalsePoll pollData={pollData as TrueFalsePoll} pollid={pollid as string}/>
				}
                {
					pollData.type === "order" && <CreateOrderingPoll pollData={pollData as OrderPoll} pollid={pollid as string}/>
				}
            </div>
        </main>
    );
}
