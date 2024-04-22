import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { onAuthStateChanged } from "firebase/auth";
import Loader from "@/components/loader/loader";
import Unauthorized from "@/components/unauthorized/unauthorized";
import s from "./profile.module.scss";
import { auth, db } from "@/firebase/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import Classroom from "@/models/class";

interface Class {
    cid: string;
    class: Classroom;
}

export default function Profile() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState<Class[]>([]);

    async function getenrolled() {
        console.log("getting enrolled classes");
        setLoading(true);
        try {
            const user = auth.currentUser;

            const userRef = doc(db, "users", user!.email!);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                console.log("User document data:", userSnap.data());
                // Get the array of enrolled class IDs
                const enrolledClassesIds: string[] = userSnap.data().enrolled || [];

                // Fetch each class using its ID
                const classesPromises = enrolledClassesIds.map(classId =>
                    getDoc(doc(db, "classes", classId))
                );
                const classesSnapshots = await Promise.all(classesPromises);

                // Map each class to its ID
                const newClasses = classesSnapshots.map(
                    (doc) => {
                        const data = doc.data();
                        console.log(data);
                        const cid = doc.id;
                        return { cid, class: data as Classroom };
                    }
                );
                setEnrolled(newClasses);
            } else {
                console.log("User document does not exist");
            }

        } catch (e) {
            console.error("Error getting documents: ", e);
        }
        setLoading(false);
    }

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
            if (user) {
                getenrolled();
            }
        })

        return () => {
            unsubscribe();
        }

    }, []);

    if (!user) { return (<Unauthorized />); }

    if (loading) { return (<Loader flex/>); }

    return (
        <div className={s.profile}>
            <h1>Account</h1>
            <button
                onClick={logout}
            >Logout</button>
            <h3>
                Name: {user?.displayName}
                Email: {user?.email}
            </h3>
            <h3>
                Classes you're taking:
            </h3>
        </div>
    );
}
