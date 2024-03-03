import { use, useEffect, useState } from "react"
import s from "./home.module.scss"
import { faUser, faHome, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from "next/router";
import { db, auth } from "../../firebase/firebaseconfig";
import { collection, getDocs, where, query, addDoc, setDoc, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Classroom from "@/models/class";
import Loader from "@/components/loader/loader";
import { useAuth } from "@/context/authcontext";
import Unauthorized from "@/components/unauthorized/unauthorized";
import { useGlobal } from "@/context/globalcontext";
import Link from "next/link";

interface Class {
    id: string;
    class: Classroom;
}

export default function Home() {
    const router = useRouter();
    const { user, googlesignin, logout } = useAuth();
    const { } = useGlobal();

    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<Class[]>([]);
    const [enrolled, setEnrolled] = useState<Class[]>([]);

    const [joinClass, setJoinClass] = useState(false);
    const [classCode, setClassCode] = useState("");

    async function joinclass() {
        console.log(classCode);
        try {
            const user = auth.currentUser;
            const uid = user!.uid;

            // go through the classes collection, and look for the document class that has field classid equal to classCode
            const classQuery = query(collection(db, "classes"), where("classid", "==", classCode));

            // get the actual firebase id of that class, and add the user to the students collection
            const classSnapshot = await getDocs(classQuery);
            const classDoc = classSnapshot.docs[0];

            const studentData = {
                uid: uid,
                email: user!.email,
                name: user!.displayName
            };

            const studentsCollectionRef = collection(db, "classes", classDoc.id, "students");
            await setDoc(doc(studentsCollectionRef, uid), studentData);

            // add the classDoc.id to the user's enrolled classes list
            const userRef = doc(db, "users", user!.email!);
            await updateDoc(userRef, {
                enrolled: arrayUnion(classDoc.id)
            });

            console.log("Added student with ID: ", studentsCollectionRef.id);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }

        setJoinClass(false);
        setClassCode("");
        getclass();
    }

    async function getclass() {
        setLoading(true);
        try {
            const user = auth.currentUser;
            const uid = user!.uid;

            const userClassesQuery = query(collection(db, "classes"), where("owner.uid", "==", uid));
            const userClassesSnapshot = await getDocs(userClassesQuery);
            const newClasses = userClassesSnapshot.docs.map(
                (doc) => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, class: data as Classroom };
                }
            );
            setClasses(newClasses);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
        setLoading(false);
    }

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
                        const id = doc.id;
                        return { id, class: data as Classroom };
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

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                getclass();
                getenrolled();
            }
        })

        return () => {
            unsubscribe();
        }

    }, []);

    if (!user) { return (<Unauthorized />); }

    if (loading) { return (<Loader />); }

    return (
        <div className={s.home}>
            <main className={s.main}>
                <div className={s.classes}>
                    <div className={s.details}>
                        <h2>my classes</h2>
                        <div className={s.create} onClick={() => { router.push("/create/class") }}>
                            <FontAwesomeIcon icon={faPlus} />
                            create a class
                        </div>
                    </div>
                    {classes.map((classData, index) => (
                        <div className={s.class}>
                            <div className={`${s.trap} ${s.yellow}`}>
                                <span>{classData.class.classid}</span>
                            </div>
                            <div className={`${s.content} ${s.yellow}`}>
                                <div className={s.info}>
                                    <div className={s.code}>{classData.class.classname}</div>
                                    <div className={s.name}>{classData.class.description}</div>
                                    <div className={s.teacher}>{classData.class.owner.name}</div>
                                </div>
                                <div className={s.actions}>
                                    <Link
                                        href={{
                                            pathname: '/class/' + classData.class.classid,
                                            query: { classid: classData.id }
                                        }}
                                    >
                                        <div className={s.join}>enter</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={s.seperator}></div>

                <div className={s.classes}>
                    <div className={s.details}>
                        <h2>classes i'm taking</h2>
                        {
                            joinClass ?
                                <div className={s.join}>
                                    <input type="text" placeholder="class code"
                                        onChange={(e) => { setClassCode(e.target.value) }}
                                    />
                                    <button
                                        onClick={joinclass}
                                    >
                                        <FontAwesomeIcon icon={faRightToBracket} />
                                    </button>
                                </div>
                                :
                                <div className={s.join}
                                    onClick={() => { setJoinClass(true) }}
                                >
                                    <FontAwesomeIcon icon={faRightToBracket} />
                                    join a class
                                </div>
                        }
                    </div>
                    {
                        enrolled.map((classData, index) => (
                            <div className={s.class}>
                                <div className={`${s.trap} ${s.yellow}`}>
                                    <span>{classData.class.classid}</span>
                                </div>
                                <div className={`${s.content} ${s.yellow}`}>
                                    <div className={s.info}>
                                        <div className={s.code}>{classData.class.classname}</div>
                                        <div className={s.name}>{classData.class.description}</div>
                                        <div className={s.teacher}>{classData.class.owner.name}</div>
                                    </div>
                                    <div className={s.actions}>
                                        <Link
                                            href={{
                                                pathname: '/class/' + classData.class.classid,
                                                query: { classid: classData.id }
                                            }}
                                        >
                                            <div className={s.join}>enter</div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </main>
        </div>
    )
}