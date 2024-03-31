import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Classroom from '@/models/class';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';
import { useAuth } from '@/context/authcontext';

export default function gradebook() {
    const router = useRouter();
    const { class: classId } = router.query;
    const { user } = useAuth()

    const [authorized, setAuthorized] = useState(false);

    async function checkAuthorization() {
        try {
            const classRef = doc(db, "classes", classId as string);
            const classSnapshot = await getDoc(classRef);

            if (classSnapshot.exists()) {
                const classData = classSnapshot.data() as Classroom;
                if (classData.owner.uid == user?.uid) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            }
        } catch (error) {
            console.log("Error fetching class");
        }

    }

    useEffect(() => {
        if (classId && user) {
            checkAuthorization()
        }
    }, [classId, user]);

    return (
        <div>
            {authorized ? (
                <h1>Gradebook for Class: {classId}</h1>
            ) : (
                <h1>Unauthorized to view this gradebook</h1>
            )}
        </div>
    );
}