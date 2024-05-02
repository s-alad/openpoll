import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { onAuthStateChanged } from "firebase/auth";
import Loader from "@/components/loader/loader";
import Unauthorized from "@/components/unauthorized/unauthorized";
import s from "./profile.module.scss";
import { auth, db } from "@openpoll/packages/config/firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Classroom from "@openpoll/packages/models/class";
import Image from "next/image";
import Spacer from "@/components/spacer/spacer";
import { LuPencil } from "react-icons/lu";

interface Class {
    cid: string;
    class: Classroom;
}

export default function Profile() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState<Class[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.displayName || '');
    const [editedEmail, setEditedEmail] = useState(user?.email || '');


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

    async function changeName(newName: string) {
        const user = auth.currentUser;
        if (!user) { return; }

        const userRef = doc(db, "users", user.email!);

        try {
            await updateDoc(userRef, {
                name: newName
            });
            console.log("name updated");

            await updateProfile(user, {
                displayName: newName
            });
        } catch (e) {
            console.error("Error updating name: ", e);
        }
    }

    async function changeEmail(newEmail: string) {
        const user = auth.currentUser;
        if (!user) { return; }

        const userRef = doc(db, "users", user.email!);

        try {
            await updateDoc(userRef, {
                email: newEmail,
            });
            console.log("Firestore email updated");
        } catch (e) {
            console.error("Error updating email: ", e);
        }
    }

    async function handleSaveChanges() {
        await changeName(editedName);
        // await changeEmail(editedEmail); 
        setIsEditing(false);
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

    if (loading) { return (<Loader flex />); }

    return (
        <div className={s.profile}>
            <div className={s.acc}>
                <h1>Account</h1>
            </div>

            <div className={s.details}>
                <div className={s.left}>
                    <h2>Enrolled Classes</h2>
                    <ul>
                        {enrolled.map(({ cid, class: c }) => (
                            <li key={cid}>
                                <p>{c.classname}</p>
                            </li>
                        ))}
                    </ul>
                    {enrolled.length === 0 && <p>You are not enrolled in any classes</p>}
                </div>

                <div className={s.right}>
                    <h2>Account Information</h2>

                    <div>
                        <span style={{ fontWeight: '600', marginRight: '40px' }}>Name</span>
                        {
                            isEditing ?
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                />
                                :
                                <span>{user?.displayName}</span>
                        }
                        <button className={s.edit} onClick={() => setIsEditing(!isEditing)}>
                            <LuPencil />
                        </button>
                    </div>

                    <div>
                        <span style={{ fontWeight: '600', marginRight: '40px' }}>Email</span>
                        <span>{user?.email}</span>
                        {
                            isEditing &&
                            <button className={s.save} onClick={handleSaveChanges}>
                                Save changes
                            </button>
                        }
                    </div>

                    <Spacer />

                    <button onClick={logout}>
                        <Image
                            src="/logout.svg"
                            alt="Logout"
                            width={20}
                            height={20}
                        />Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
