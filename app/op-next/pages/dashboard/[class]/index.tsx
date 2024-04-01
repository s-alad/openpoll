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

interface PollAndId {
    poll: Poll;
    id: string;
}

export default function Dashboard() {

    const [loading, setLoading] = useState(false);

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.class;
    console.log(classid);

    const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);

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
        }
    }, [classid]);

    return (
        <div className={s.class}>
            {
                loading ? <Loader/> :

                    <div className={s.openpolls}>
                        {
                            openpolls.map((poll, index) => {
                                return (
                                    <div key={index} className={s.poll}>
                                        <div className={s.details}>
                                            <div className={s.question}>{poll.poll.question}</div>

                                            {/* <div>created: {new Date(poll.poll.created.seconds).toLocaleDateString()}</div> */}

                                            <div>created: {new Date(poll.poll.created.seconds).toLocaleDateString()}</div>
                                        </div>
                                        <div className={s.actions}>
                                            <button className={s.configure}>configure</button>
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
                    </div>
            }

            <div className={s.stalepolls}>

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
        </div>
    )
}