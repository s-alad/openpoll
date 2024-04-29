import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import s from './dashboard.module.scss';
import Link from 'next/link';
import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseconfig';
import Poll, { PollAndId, TLPoll, TPoll, convertPollTypeToText, getCorrectPollType } from '@/models/poll';
import Loader from '@/components/loader/loader';
import Image from 'next/image';
import { PiChatsDuotone, PiChatsFill } from "react-icons/pi";
import { getClassnameFromId } from '@/models/class';
import MCPoll from '@/models/poll/mc';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/context/authcontext';


export default function Dashboard() {

    const [isaddAdmin, setisaddAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const { user, loading: authloading } = useAuth();
    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classid;
    const [classname, setClassname] = useState<string>("");

    const [taId, settaId] = useState<string>("");
    const [adminId, setadminId] = useState<string>("");
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);
    const [selectedType, setSelectedType] = useState<TPoll>("mc");

    async function handleSubmit(event: any) {
        event.preventDefault();

        try {
            addAdmin(adminId);
            setadminId("");
        } catch (e) {
            console.error("Error adding TA: ", e);
        }


    }

    async function addAdmin(userEmail: string) {
        setLoading(true);
        const classRef = doc(db, "classes", classid as string);
        const userRef = doc(db, "users", userEmail);
        
        try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                console.log("Document data:", userSnap.data()); // Handle the data as needed
                const userData = userSnap.data();
                console.log(userData);  
                const userId = userSnap.id;

                await updateDoc(classRef, {
                    admin: arrayUnion(userId) // add the user email to the admin array
                });      
            } else {
                console.log("No such document!");            
            }

        } catch (e) {
            console.error("Error adding TA: ", e);
        }

        setLoading(false);
    }   

    async function checkOwner() {
        const classRef = doc(db, "classes", classid as string);
        const user = auth.currentUser;
        if (!user) return;
        const uid = user!.uid;
        console.log(uid);

        const classSnap = await getDoc(classRef);
        if (classSnap.exists()) {
            const classData = classSnap.data();
            if (classData.owner.uid === uid) {
                console.log("Owner");
                setIsOwner(true);
            } else {
                console.log("Not Owner");
                setIsOwner(false);
            }
        }
    }

    async function getpolls() {
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        console.log(classref);
        const pollsref = collection(classref, "polls");

        try {
            const snapshot = await getDocs(pollsref);
            let openpolls: PollAndId[] = [];
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data();
                let poll = getCorrectPollType(data);

                if (!poll) return;
                if (!data.classid) return;
                console.log(pid, data);

                openpolls.push({ poll: poll, id: pid } as PollAndId)
            });
            setOpenpolls(openpolls);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }

    // execute necessary functions
    async function main() {
        setLoading(true);
        await getpolls();
        await checkOwner();
        const classname = await getClassnameFromId(classid as string);
        setClassname(classname);
        setLoading(false);
    }

    //wait for router to load
    useEffect(() => {
        if (user && classid) {
            main();
        }
    }, [classid]);
    if (!user || authloading || !classid) { return (<div></div>) }

    return (
        <div className={s.dashboard}>
            {
                loading ? <Loader /> :

                    <div className={s.openpolls}>
                        <div className={s.info}>
                            <div className={s.classinfo}>
                                <div className={s.classname}>
                                    {classname}
                                </div>
                                <div className={s.date}>
                                    {new Date().toLocaleDateString()}
                                </div>
                                {isOwner && (
                                    isaddAdmin ? (
                                        <div className={s.addAdmin}>
                                            <form onSubmit={handleSubmit}>
                                                <input 
                                                    type="text" 
                                                    value={adminId}
                                                    onChange={(e) => setadminId(e.target.value)}
                                                    placeholder="Enter Admin Email"
                                                    required
                                                    />
                                                    <button type="submit">
                                                        <FontAwesomeIcon icon={faRightToBracket} /> Add Admin
                                                    </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className={s.addAdmin} onClick={() => setisaddAdmin(true)}>
                                            Add Admin
                                        </div>
                                    )                          
                                )}
                            </div>

                            <Link
                                href={{
                                    pathname: `/create/poll/${classid}`,
                                }}
                            >
                                <div className={s.add}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </div>
                            </Link>

                        </div>

                        <div className={s.selector}>
                            {
                                TLPoll.map((type, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`${s.selectee} ${selectedType === type ? s.selected : ""}`}
                                            onClick={() => setSelectedType(type as TPoll)}
                                        >
                                            {convertPollTypeToText(type as TPoll)}
                                        </div>
                                    )
                                })
                            }
                        </div>

                        {
                            openpolls.filter(poll => poll.poll.type === selectedType).map((poll, index) => {
                                return (
                                    <div key={index} className={s.poll}>
                                        <div className={s.details}>
                                            <div className={s.question}>
                                                <PiChatsFill />
                                                {poll.poll.question}
                                            </div>
                                            <div className={s.created}>created: {new Date(poll.poll.createdat.seconds * 1000).toLocaleDateString()}</div>
                                            <div className={s.polltype}>
                                                {convertPollTypeToText(poll.poll.type as TPoll)}
                                            </div>
                                        </div>
                                        {
                                            poll.poll.done ? 
                                            <div>
                                                completed
                                            </div> :
                                            <div className={s.actions}>
                                            <Link
                                                href={{
                                                    pathname: `/edit/${classid}/poll/${poll.id}`, 
                                                }}
                                            >
                                                <button className={s.configure}>edit</button>
                                            </Link>
                                            <Link
                                                href={{
                                                    pathname: `/live/${classid}/${poll.id}`,
                                                }}
                                            ><button className={s.live}>go live</button></Link>
                                        </div>
                                        }
                                    </div>
                                )
                            })
                        }

                        {
                            openpolls.filter(poll => poll.poll.type === selectedType).length < 1 ?
                                <Image
                                    src="/dashboard-bg.png"
                                    alt="logo"
                                    width={591}
                                    height={529}
                                /> : null
                        }
                    </div>
            }

        </div>
    )
}