import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import s from './settings.module.scss';
import Link from 'next/link';
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, fxns } from '@openpoll/packages/config/firebaseconfig';
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
import { httpsCallable } from 'firebase/functions';

interface Student {
    name: string;
    email: string;
    uid: string;
}

export default function Settings() {
    const router = useRouter();
    const { user, loading: authloading } = useAuth();
    const classid = router.query.classid as string;
    const [loading, setLoading] = useState(false);
    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);

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

    async function getStudents() {
        const classRef = doc(db, "classes", classid);
        const studentRef = collection(classRef, "students");
        const snapshot = await getDocs(studentRef);
        let students: Student[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (Object.keys(data).length === 0) { return; }
            students.push({ name: data.name, email: data.email, uid: data.uid} as Student);
        });
        console.log(students);
        setStudents(students);
    }

    async function removeStudentFromClass(student: Student) {
        setLoading(true);
        // remove that students document from the students collection in the class
        try {
            const classRef = doc(db, "classes", classid);
            const studentDocRef = doc(classRef, "students", student.uid); 
            console.log('studentid', student.uid);
            console.log(studentDocRef);
            await deleteDoc(studentDocRef);
        } catch (error) {
            console.error("Error removing student from class");
        }

        // call the firebase function 'removeClassFromUser' to remove the the classid from the students classids array
        try {
            const removeClassFromUserFxn = httpsCallable(fxns, "removeClassFromUser");
            const res = await removeClassFromUserFxn({ email: student.email, classid: classid });
            console.log(res);
        } catch (error) {
            console.error("Error removing class from user");
            console.error(error);
        }

        const reload = await getStudents();
        setLoading(false);
    }

    // execute necessary functions
    async function main() {
        setLoading(true);
        const c: Classroom | null = await getClassFromId(classid);
        await getStudents();
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

                    <div className={s.students}>
                        <div className={s.title}>students</div>
                        {
                            students.length === 0 &&
                            <div className={s.empty}>
                                No students are currently enrolled in this class
                            </div>
                        }
                        {
                            students.map((student, index) => {
                                return (
                                    <div className={s.student} key={index}>
                                        <div className={s.idx}>{index + 1}</div>
                                        <div className={s.name}>{student.name}</div>
                                        <div className={s.email}>{student.email}</div>
                                        <div className={s.remove}
                                            onClick={() => removeStudentFromClass(student)}
                                        >
                                            <MdOutlineRemoveCircle />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            }
        </div>
    )
}