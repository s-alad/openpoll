import Navbar from "@/layout/navbar/navbar"

import s from "./create.class.module.scss"

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth, db, fxns } from "../../../firebase/firebaseconfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent } from 'react';
import ClassInput from "@/components/class-input/class-input";
import { useForm } from "react-hook-form";
import { createclassformdata } from "@/models/form";
import { createClassSchema } from "@/models/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "@/components/loader/loader";


export default function CreateClass() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function createclass(data: createclassformdata) {
        setLoading(true);
        console.log('form data submitted:', data);

        const user = auth.currentUser;
        const uid = user!.uid;

        const classdata = {
            classname: data.classname,
            description: data.description,
            owner: {
                uid: uid,
                email: user!.email,
                name: user!.displayName
            },
            admin: [],
        }

        try {
            const docRef = await addDoc(collection(db, "classes"), classdata);
            const pollsCollectionRef = collection(db, "classes", docRef.id, "polls");
            const studentsCollectionRef = collection(db, "classes", docRef.id, "students");
            await addDoc(studentsCollectionRef, {});
            await addDoc(pollsCollectionRef, {});

            console.log("Document written with ID: ", docRef.id);
            router.push("/home");

        } catch (e) {
            console.error("Error adding document: ", e);
        }

        setLoading(false);
    }

    const { register, handleSubmit, setError, formState: { errors } } = useForm<createclassformdata>({
        resolver: zodResolver(createClassSchema)
    });

    return (
        <>
            <main className={s.createclass}>
                {
                    loading ? <Loader /> :
                        <div className={s.create}>
                            <div className={`${s.trap} ${s.yellow}`}></div>
                            <form onSubmit={handleSubmit(createclass)}>
                                <ClassInput
                                    type="text"
                                    name="classname"
                                    register={register}
                                    error={errors.classname}
                                />

                                <ClassInput
                                    type="text"
                                    name="description"
                                    register={register}
                                    error={errors.description}
                                />
                                <button type="submit">Create Class</button>
                            </form>
                        </div>
                }
            </main>
        </>
    );
};
