import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authcontext";
import { onAuthStateChanged } from "firebase/auth";
import Loader from "@/components/loader/loader";
import Unauthorized from "@/components/unauthorized/unauthorized";
import s from "./profile.module.scss";
import { auth, db } from "@/firebase/firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Classroom from "@openpoll/packages/models/class";
import Image from "next/image";

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

    async function handleEditClick() {
        setIsEditing(true);
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

    if (loading) { return (<Loader flex/>); }

    return (
        <div className={s.profile}>
            <h1 style={{alignItems: 'center', textAlign: 'center'}}>Account</h1>
            <div className={s.boxContainer}>
                <div className={s.leftBox}>
                    <h2>Enrolled Classes</h2>
                    <ul>
                        {enrolled.map(({ cid, class: c }) => (
                            <li key={cid}>
                                <p>{c.classname}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={s.rightBox}>
                    <h2>Account Information</h2>
                    <button
                        onClick={logout}
                    >
                        <Image 
                            src="/logout.svg"
                            alt="Logout"
                            width={20}
                            height={20}
                        />Logout
                    </button>
                    <p> <span style={{ fontWeight: '600', marginRight: '40px'}}>Name</span> 
                    
                    { isEditing ? (
                        <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        />
                    ) : (
                        <span>{user?.displayName}</span>
                    )}
                    <button className={s.edit} onClick={handleEditClick}><Image 
                        src="/mode_edit.svg"
                        alt="edit"
                        width={20}
                        height={20}
                        style={{ marginLeft: '10px', alignItems: 'center'}}
                    />
                    </button>
                    </p>
                    <p> <span style={{ fontWeight: '600', marginRight: '40px'}}>Email</span> 
                       <span>{user?.email}</span>
                    {isEditing && (
                        <button className={s.saveChanges} onClick={handleSaveChanges}>
                            Save changes
                        </button>
                    )}
                    </p>
                </div>
            </div>
        </div>
    );
}
