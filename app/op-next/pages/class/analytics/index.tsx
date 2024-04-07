import s from './analytics.module.scss';
import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";
import RenderBarChart from '@/components/barchart/barchart';

export default function Analytics() {
    const router = useRouter();
    const classid = "Kyfh71LioSJvUPXv7W2v";
    
    // 0 = Pie Chart, 1 = Bar Chart, 2 = Scatter
    const analyticsView = 1;

    const [openpolls, setOpenpolls] = useState<Poll[]>([]);
    const [pollBarchartData, setPollBarchartData] = useState<{ label: string; value: number }[][]>([]);
    const [loading, setLoading] = useState(true);

    async function getpolls() {
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        const pollsref = collection(classref, "polls");
    
        try {
            const snapshot = await getDocs(pollsref);
            let donePolls: Poll[] = [];
    
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const poll = doc.data() as Poll;
                
                if (poll.done) {
                    donePolls.push(poll);
                }
            });
    
            setOpenpolls(donePolls);
            setLoading(false);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }
    
    useEffect(() => {
        getpolls();
    }, []); // Run only once on component mount

    return(
        <div className={s.class}>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {openpolls.map((data, index) => (
                        <RenderBarChart poll={data} key={index}/>
                    ))}
                </div>
            )}
        </div>
    );
}
