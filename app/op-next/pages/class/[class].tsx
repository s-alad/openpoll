import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './class.module.scss';
import Link from 'next/link';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from '@/models/poll';

export default function Class() {

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.class;

    
    const [openpolls, setOpenpolls] = useState<Poll[]>([]);

    async function getpolls() {
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        console.log(classref);
        const pollsref = collection(classref, "polls");

        try {
            const snapshot = await getDocs(pollsref);
            let openpolls: Poll[] = [];
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data() as Poll;
                if (!data.classid) return;
                console.log(pid, data);
                openpolls.push(data);
            });
            setOpenpolls(openpolls);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }


    }

    //wait for router to load
    useEffect(() => {
        if (classid) {
            getpolls();
        }
    }, [classid]);

    return (
        <div className={s.class}>
            
            <div className={s.openpolls}>
                {
                    openpolls.map((poll, index) => {
                        return (
                            <div key={index} className={s.poll}>
                                <div className={s.details}>
                                    <div className={s.question}>{poll.question}</div>
                                    <div>created: {new Date(poll.created.seconds).toLocaleDateString()}</div>
                                </div>
                                <div className={s.actions}>
                                    <button className={s.configure}>configure</button>
                                    <button className={s.live}>go live</button>
                                </div>
                            </div>
                        )
                    })
                }

            </div>

            <div className={s.stalepolls}>

            </div>

            <div className={s.start}>
                <Link
                    href={{
                        pathname: '/create/poll',
                        query: { classid: router.query.classid }
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