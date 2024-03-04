import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;

    const [students, setStudents] = useState([])

    async function getStudents() {
        // collection classes -> document ID -> collection students
        const classref = doc(db, "classes", classid as string)

        // Grab the students from the class
        const studentsref = collection(classref, "students")
        
        // Grab the polls
        const pollsref = collection(classref, "polls")

        
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