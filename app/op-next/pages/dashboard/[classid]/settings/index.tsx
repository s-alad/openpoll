import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import s from './settings.module.scss';
import Link from 'next/link';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '@openpoll/packages/config/firebaseconfig';
import Poll, { PollAndId, TLPoll, TPoll, convertPollTypeToText, getCorrectPollType } from '@openpoll/packages/models/poll';
import Loader from '@/components/loader/loader';
import Image from 'next/image';
import { PiChatsDuotone, PiChatsFill } from "react-icons/pi";
import Classroom, { Class, getClassFromId, getClassnameFromId } from '@openpoll/packages/models/class';
import MCPoll from '@openpoll/packages/models/poll/mc';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/context/authcontext';
import Spinner from '@/components/spinner/spinner';
import Button from '@/ui/button/button';
import Input from '@/ui/input/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MdOutlineRemoveCircle } from "react-icons/md";


export default function Settings() {
    const router = useRouter();
    const { user, loading: authloading } = useAuth();
    const classid = router.query.classid as string;
    const [loading, setLoading] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);

    async function addAdmin(data: { newAdminEmail: string }) {
        setLoading(true);
        console.log(data);
        const newAdminEmail = data.newAdminEmail;

        if (!newAdminEmail) { return; }
        if (classroom?.admins.emails.includes(newAdminEmail)) { return; }
        if (newAdminEmail === classroom?.owner.email) { return; }
        
        const classref = doc(db, "classes", classid);
        await updateDoc(classref, {
            "admins.emails": arrayUnion(newAdminEmail),
        });

        const reload = await getClassFromId(classid);
        setClassroom(reload);
        reset();
        setLoading(false);
    }

    async function removeAdmin(email: string) {
        setLoading(true);
        const classref = doc(db, "classes", classid);
        await updateDoc(classref, {
            "admins.emails": arrayRemove(email),
        });

        const reload = await getClassFromId(classid);
        setClassroom(reload);
        reset();
        setLoading(false);
    }

    // execute necessary functions
    async function main() {
        setLoading(true);
        const c: Classroom | null = await getClassFromId(classid);
        
        setClassroom(c);
        setLoading(false);
    }

    //wait for router to load
    useEffect(() => {
        if (user && classid) {
            main();
        }
    }, [classid]);



    const emailSchema = z.object({
        newAdminEmail: z.string().email({ message: "Invalid email address" }),
    });
    const { handleSubmit, control, reset, register, watch, formState: { errors } } = useForm({
        resolver: zodResolver(emailSchema),
    });
    const newAdminEmail = watch('newAdminEmail');


    if (!user || authloading || !classid || !classroom) { return (<Loader />) }

    if (classroom.owner.email !== user.email) {
        return (<div className={s.settings}>You are not authorized to view this page</div>)
    }

    return (
        <div className={s.settings}>
            {loading ? <Loader /> :
                <div className={s.config}>
                    <div className={s.classinfo}>
                        <div className={s.classname}>
                            {classroom?.classname}
                        </div>
                        <div className={s.date}>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    <div className={s.administration}>
                        <div className={s.title}>admins</div>
                        {
                            classroom.owner.email === user.email && Object.values(classroom.admins.emails).map((admin, index) => {
                                return (
                                    <div className={s.admin} key={index}>
                                        <div className={s.idx}>{index + 1}</div>
                                        <div className={s.email}>{admin}</div>
                                        <div className={s.remove}
                                            onClick={() => removeAdmin(admin)}
                                        >
                                            <MdOutlineRemoveCircle />
                                        </div>
                                    </div>
                                )
                            })
                        }
                        <form className={s.adder} onSubmit={handleSubmit((data) => addAdmin({ newAdminEmail: data.newAdminEmail }))}>
                            <input type="email" placeholder="add student" {...register('newAdminEmail')}/>
                            <Button text="add" type='submit'
                                disabled={classroom?.admins.emails.includes(newAdminEmail) || newAdminEmail === classroom?.owner.email}
                            />
                        </form>
                    </div>
                </div>
            }
        </div>
    )
}