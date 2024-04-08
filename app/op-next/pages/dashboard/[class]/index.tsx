import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './dashboard.module.scss';
import Link from 'next/link';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from '@/models/poll';
import Loader from '@/components/loader/loader';
import Image from 'next/image';

interface PollAndId {
    poll: Poll;
    id: string;
}

export default function Dashboard() {

    const [loading, setLoading] = useState(false);

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.class;
    const className = router.query.className;
    console.log(className, "class name")
    console.log(classid);

    type PollTypes = "Questions" | "Attendance" | "Done"
    const [polltype, setpolltype] = useState<PollTypes>("Questions");
    const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);
    const [attendancePolls, setAttendancePolls] = useState<PollAndId[]>([]);
    const [donePolls, setDonePolls] = useState<PollAndId[]>([]);

    async function getpolls() {
        setLoading(true);
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        console.log(classref);
        const pollsref = collection(classref, "polls");

        try {
            const snapshot = await getDocs(pollsref);
            let openpolls: PollAndId[] = [];
            let donepolls: PollAndId[] = [];
            let attendancepolls: PollAndId[] = [];
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data() as Poll;
                
                console.log(data.created, "date");
                if (data.done) {
                    donepolls.push({ poll: data, id: pid });
                    return;
                } else if (data.type === "attendance") {
                    attendancepolls.push({ poll: data, id: pid });
                } else {
                    // Regular polls
                    if (!data.classid) return;
                    // console.log(pid, data, "poll");
                    openpolls.push({ poll: data, id: pid })
                }


            });
            setAttendancePolls(attendancepolls);
            setDonePolls(donepolls);
            console.log(donepolls);
            setOpenpolls(openpolls);
            console.log(openpolls);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
        
        setLoading(false);
    }


    //wait for router to load
    useEffect(() => {
        if (classid) {
            getpolls();
        }
    }, [classid]);

    return (
        <>  
            <main className={s.dashboard}>
                <div className={s.classContainer}>
                    <div className={s.class}> 
                        {className}
                    </div>
                    <div className={s.date}>
                        {new Date().toLocaleDateString()}
                    </div>
                </div>
                <div className={s.header}>
                    <div className={s.selector}>
                        {
                            ["Questions" , "Attendance" , "Done"].map(type => (
                                <div
                                    key={type}
                                    onClick={() => setpolltype(type as PollTypes)}
                                    className={polltype === type ? s.selected : ""}
                                >
                                    {type}
                                </div>
                            ))
                        }
                    </div>
                    {
                        polltype === "Questions" && (
                            openpolls.map((poll, index) => {
                                return (
                                    <div key={index} className={s.poll}>
                                        <div className={s.details}>
                                            <div className={s.questContainer}>
                                                <Image
                                                    src="/question_answer.svg"
                                                    alt="user"
                                                    width={40}
                                                    height={40}
                                                />

                                                <div className={s.question}>{poll.poll.question}</div>
                                            </div>
                                            <div className={s.date}>Date created: {new Date(poll.poll.created.seconds * 1000).toLocaleDateString()}</div>
                                        </div>
                                        <div className={s.actions}>
                                            <button className={s.configure}>Configure</button>
                                            <Link
                                                href={{
                                                    pathname: `/live/${classid}/${poll.id}`,
                                                }}
                                            ><button className={s.live}>Go Live</button></Link>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                    {
                        polltype === "Attendance" && (
                            attendancePolls.map((poll, index) => {
                                return (
                                    <div key={index} className={s.poll}>
                                        <div className={s.details}>
                                            <div className={s.questContainer}>
                                                <Image
                                                    src="/question_answer.svg"
                                                    alt="user"
                                                    width={40}
                                                    height={40}
                                                />

                                                <div className={s.question}>{poll.poll.question}</div>
                                            </div>
                                        </div>
                                        <div className={s.actions}>
                                            <button className={s.configure}>Configure</button>
                                            <Link
                                                href={{
                                                    pathname: `/live/${classid}/${poll.id}`,
                                                }}
                                            ><button className={s.live}>Go Live</button></Link>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                    {
                        polltype === "Done" && (
                            donePolls.map((poll, index) => {
                                return (
                                    <div key={index} className={s.poll}>
                                        <div className={s.details}>
                                            <div className={s.questContainer}>
                                                <Image
                                                    src="/question_answer.svg"
                                                    alt="user"
                                                    width={40}
                                                    height={40}
                                                />

                                                <div className={s.question}>{poll.poll.question}</div>
                                            </div>
                                            <div className={s.date}>Date created: {new Date(poll.poll.created.seconds * 1000).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                </div>
                <div className={s.start}>
                    <Link
                        href={{
                            pathname: '/create/poll',
                            query: { classid: router.query.class }
                        }}
                    >
                        <div className={s.add}>
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                    </Link>
                </div>
                <div>
                    <Image 
                        src="/dashboard-bg.png"
                        alt="logo"
                        width={591}
                        height={529}
                    />
                </div>
            </main>
        </>
    );
}
