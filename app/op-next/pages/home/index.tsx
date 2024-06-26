import { use, useEffect, useState } from "react"
import s from "./home.module.scss"
import { faUser, faHome, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from "next/router";
import { db, auth } from '@openpoll/packages/config/firebaseconfig';
import { collection, getDocs, where, query, addDoc, setDoc, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Classroom, { Class } from "@openpoll/packages/models/class";
import Loader from "@/components/loader/loader";
import { useAuth } from "@/context/authcontext";
import Unauthorized from "@/components/unauthorized/unauthorized";
import { useGlobal } from "@/context/globalcontext";
import Link from "next/link";
import Image from "next/image";

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
            if (classSnapshot.docs.length > 0) {
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
    
                // Update the enrolled state with the new class without refreshing
                const newClass = { cid: classDoc.id, class: classDoc.data() as Classroom };
                setEnrolled([...enrolled, newClass]); // Add the new class to the enrolled state
            } else {
                console.log("No class found with the provided code.");
            }
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
            const email = user!.email!;

            const ownerQuery = query(collection(db, "classes"), where("owner.uid", "==", uid));
            const adminQuery = query(collection(db, "classes"), where("admins.emails", "array-contains", email));

            const [ownerSnapshot, adminSnapshot] = await Promise.all([
                getDocs(ownerQuery),
                getDocs(adminQuery)
            ]);

            const ownerClasses = ownerSnapshot.docs.map(doc => ({
                cid: doc.id,
                class: doc.data() as Classroom
            }));

            const adminClasses = adminSnapshot.docs.map(doc => ({
                cid: doc.id,
                class: doc.data() as Classroom             
            }));

            console.log(ownerClasses, adminClasses);

            const combinedClasses = [...ownerClasses, ...adminClasses]; 
            const uniqueClasses = combinedClasses.filter((cls, index, self) =>
                index === self.findIndex((t) => (
                    t.cid === cls.cid
                ))
            ); // Remove duplicates

            setClasses(uniqueClasses);
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
                        const cid = doc.id;
                        return { cid, class: data as Classroom } as Class;
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

    if (loading) { return (<Loader flex/>); }

    return (
        <div className={s.home}>
            <main className={s.main}>
                <div className={s.classes}>
                    <div className={s.details}>
                        <h2>My Classes</h2>
                        <div className={s.create} onClick={() => { router.push("/create/class") }}>
                            <FontAwesomeIcon icon={faPlus} />
                            Create
                        </div>
                    </div>
                    {classes.map((classData, index) => (
                        <div className={s.class} key={index}>
                            <div className={`${s.trap} ${s.yellow}`}>
                                {classData.class.classidentifier}
                            </div>
                            <div className={`${s.content} ${s.yellow}`}>
                                <div className={s.info}>
                                    <div className={s.className}>{classData.class.description}</div>
                                    <div className={s.classDescription}>{classData.class.classname}</div>

                                    <div className={s.classDetails}>
                                        <span className={s.teacher}>{classData.class.owner.name}</span>
                                        <span className={s.courseCode}> | Join Code: {classData.cid.substring(0,6)}</span>
                                    </div>
                                </div>
                                <div className={s.actions}>
                                    <Link
                                        href={{
                                            pathname: '/dashboard/' + classData.cid,
                                        }}
                                        className={s.link}
                                    >
                                        <div className={s.join}>Enter</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={s.seperator}></div>

                <div className={s.classes}>
                    <div className={s.details}>
                        <h2>Classes Enrolled</h2>
                        {
                            joinClass ?
                                <div className={s.join}>
                                    <input type="text" placeholder="class code" className={s.joiner}
                                        onChange={(e) => { setClassCode(e.target.value) }}
                                    />
                                    <button onClick={joinclass}>
                                        <FontAwesomeIcon icon={faRightToBracket} />
                                    </button>
                                </div>
                                :
                                <div className={s.join} onClick={() => { setJoinClass(true) }}>
                                    <FontAwesomeIcon icon={faRightToBracket} />
                                    Join
                                </div>
                        }
                    </div>
                    {
                        enrolled.map((classData, index) => (
                            <div className={s.class} key={index}>
                                <div className={`${s.trap} ${s.yellow}`}>
                                    {classData.class.classidentifier}
                                </div>
                                <div className={`${s.content} ${s.yellow}`}>
                                    <div className={s.info}>
                                        <div className={s.className}>{classData.class.description}</div>
                                        <div className={s.classDescription}>{classData.class.classname}</div>

                                        <div className={s.classDetails}>
                                            <span className={s.teacher}>{classData.class.owner.name}</span>
                                            <span className={s.courseCode}> | Join Code: {classData.cid.substring(0,6)}</span>
                                        </div>
                                    </div>
                                    <div className={s.actions}>
                                        <Link
                                            href={{
                                                pathname: '/class/' + classData.cid,
                                            }}
                                            className={s.link}
                                        >
                                            <div className={s.join}>Enter</div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    {
                        enrolled.length === 0 &&
                            <Image
                                src="/PeersArtwork.png"
                                alt="Open Poll Logo"
                                width={500}
                                height={500}
                                className={s.peersArtwork}
                            />
                    }
                </div>
            </main>
        </div>
    )
}