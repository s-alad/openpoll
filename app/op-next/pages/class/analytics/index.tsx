import s from './analytics.module.scss';
import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;

    
    const sampleAnswers = {
        "A": 10,
        "B": 5,
        "C": 2,
        "D": 4
    }

    
    // const [students, setStudents] = useState([])
    // const [openpolls, setOpenpolls] = useState<Poll[]>([])

    // async function getPolls() {
    //     // collection classes -> document ID -> collection students
    //     const classref = doc(db, "classes", classid as string)
    //     // Grab the polls
    //     const pollsref = collection(classref, "polls")
        
    //     try {
    //         const pollsSnapshot = await getDocs(pollsref);
            
    //         let openpolls: Poll[] = [];
    //         pollsSnapshot.forEach((doc) => {
    //             const pid = doc.id;
    //             const data = doc.data() as Poll;
    //             if (!data.classid) return;
    //             console.log(pid, data);
    //             openpolls.push(data);
    //         });
    //         setOpenpolls(openpolls)
    //     } catch (e) {
    //         console.error("Error getting documents: ", e);
    //     }
    // }



    // useEffect(() => {
    //     if (classid) {
    //         getPolls()
    //     }
    // }, [classid])

    return(
        <>
        <div className={s.class}>
            <div className={s.classAverage}>
            {/* Place whole averages here */}
            </div>

            <div className={s.pollAnalyticsView}>
                {/* Place Poll views here */}
            </div>
        </div>
        </>
    );
}