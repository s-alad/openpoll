import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;

    const [students, setStudents] = useState([])
    const [openpolls, setOpenpolls] = useState<Poll[]>([])

    async function getStudents() {
        // collection classes -> document ID -> collection students
        const classref = doc(db, "classes", classid as string)

        // Grab the students from the class
        const studentsref = collection(classref, "students")
        
        // Grab the polls
        const pollsref = collection(classref, "polls")
        
        try {
            const pollsSnapshot = await getDocs(pollsref);
            const studentSnapshot = await getDocs(studentsref);
            
            // { pollsId : Answer }
            let openpolls: { [key: string]: Poll };
            pollsSnapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data() as Poll;
                if (!data.classid) return;
                console.log(pid, data);
                openpolls[pid] = data
            })

            let studentAnswers: { [key: string]: [] }

        } catch (e) {
            console.error("Error getting documents: ", e);
        }
        
    }


    useEffect(() => {
        if (classid) {
            getStudents()
        }
    }, [classid])

    return(
        <div>{classid}</div>
    );
}