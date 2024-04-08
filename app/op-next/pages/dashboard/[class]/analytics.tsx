import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";
import RenderBarChart from '@/components/barchart/barchart';
import { useAuth } from '@/context/authcontext';
import { onAuthStateChanged } from 'firebase/auth';

export default function analytics() {
    const router = useRouter();
    const { class: classId } = router.query;
    const { user } = useAuth();
    
    const [openpolls, setOpenpolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    async function getpolls() {
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classId as string);
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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && classId) {
                getpolls();
            }
        });

        return () => unsubscribe();
    }, [classId]);

    return (
        <div>
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
