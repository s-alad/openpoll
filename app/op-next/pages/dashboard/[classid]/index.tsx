import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './dashboard.module.scss';
import Link from 'next/link';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll, { convertPollTypeToText } from '@/models/poll';
import Loader from '@/components/loader/loader';
import Image from 'next/image';
import { PiChatsDuotone, PiChatsFill } from "react-icons/pi";
import { getClassnameFromId } from '@/models/class';

interface PollAndId {
    poll: Poll;
    id: string;
}

export default function Dashboard() {

    const [loading, setLoading] = useState(false);

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classid;
    const [classname, setClassname] = useState<string>("");

    const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);
    type PollTypes = "mc" | "short" | "order" | "attendance";
    let polllookup: { [key: string]: string } = {
        "mc": "Multiple Choice",
        "short": "Short Answer",
        "order": "Ordering",
        "attendance": "Attendance"
    }
    const [selectedType, setSelectedType] = useState<PollTypes>("mc");

    async function getpolls() {
        setLoading(true);
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        console.log(classref);
        const pollsref = collection(classref, "polls");

        try {
            const snapshot = await getDocs(pollsref);
            let openpolls: PollAndId[] = [];
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data() as Poll;
                if (!data.classid) return;
                console.log(pid, data);
                openpolls.push({ poll: data, id: pid })
            });
            setOpenpolls(openpolls);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }

        setLoading(false);
    }

    //wait for router to load
    useEffect(() => {
        if (classid) {
            getpolls();
            const classname = getClassnameFromId(classid as string);
            classname.then((name) => {
                setClassname(name);
            });
        }
    }, [classid]);

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
                                Object.keys(polllookup).map((type, index) => {
                                    return (
                                        <div
                                            key={index}
                                            className={`${s.selectee} ${selectedType === type ? s.selected : ""}`}
                                            onClick={() => setSelectedType(type as PollTypes)}
                                        >
                                            {polllookup[type] as string}
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
                                            <div className={s.created}>created: {new Date(poll.poll.created.seconds).toLocaleDateString()}</div>
                                            <div className={s.polltype}>
                                                {convertPollTypeToText(poll.poll.type)}
                                            </div>
                                        </div>
                                        <div className={s.actions}>
                                            <button className={s.configure}>edit</button>
                                            <Link
                                                href={{
                                                    pathname: `/live/${classid}/${poll.id}`,
                                                }}
                                            ><button className={s.live}>go live</button></Link>
                                        </div>
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