import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import s from './settings.module.scss';
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


export default function Settings() {
    const router = useRouter();
    const { user, loading: authloading } = useAuth();
    const classid = router.query.classid as string;
    const [loading, setLoading] = useState(false);


    // execute necessary functions
    async function main() {
        setLoading(true);

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

                    </div>
            }

        </div>
    )
}