import Navbar from "@/layout/navbar/navbar"

import s from "./create.class.module.scss"

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth, db, fxns } from "../../../firebase/firebaseconfig";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent } from 'react';
import { useForm } from "react-hook-form";
import { CreateClassFormData } from "@/validation/form";
import { createClassSchema } from "@/validation/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "@/components/loader/loader";
import Input from "@/ui/input/input";
import Classroom, { Class } from "@/models/class";


export default function CreateClass() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function createclass(data: CreateClassFormData) {
        setLoading(true);
        console.log('form data submitted:', data);

        const user = auth.currentUser;
        const uid = user!.uid;

        const classdata: Classroom = {
            admin: [],
            classid: "",
            classname: data.classname,
            classidentifier: data.classidentifier,
            description: data.description,
            owner: {
                uid: uid,
                email: user!.email!,
                name: user!.displayName!
            },
            students: {},
            polls: {}
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

    const { register, handleSubmit, setError, formState: { errors } } = useForm<CreateClassFormData>({
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
                                <Input<CreateClassFormData>
                                    label="Class Name"
                                    type="text"
                                    name="classname"
                                    register={register}
                                    placeholder="Spark! Innovation Lab"
                                    error={errors.classname}
                                />
                                <Input<CreateClassFormData>
                                    label="Class Identifier"
                                    type="text"
                                    name="classidentifier"
                                    register={register}
                                    placeholder="XC475"
                                    error={errors.classidentifier}
                                />
                                <Input<CreateClassFormData>
                                    label="Description"
                                    type="textarea"
                                    name="description"
                                    register={register}
                                    placeholder="This class is all about innovation and creativity. We will be working on a variety of projects that will challenge your creativity and problem-solving skills."
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
