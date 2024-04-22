import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseconfig";
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateOrderingPoll from '@/forms/create-ordering-poll/create-ordering-poll';
import s from './edit.poll.module.scss';
import Poll, { convertPollTypeToText } from '@/models/poll';

export default function EditPoll() {
    const router = useRouter();
    const { pollid, classid } = router.query;
    const [pollData, setPollData] = useState({
        pollid: "",
        type: "",
        question: "",
        answers: [""],
        options: [{}]

    });
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
                const data = docSnap.data() as Poll

                if (docSnap.exists()) {
                    setPollData({
                        pollid: pollid as string,
                        type: data.type,
                        question: data.question,
                        answers: ensureArray(data.answers),
                        options: data.options
                    });
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
					pollData.type === "mc" && <CreateMultipleChoicePoll pollData={pollData}/>
				}
                {
					pollData.type === "short" && <CreateShortAnswerPoll pollData={pollData}/>
				}
            </div>
        </main>
    );
}