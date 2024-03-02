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
import { formdata } from "@/models/form";
import { matchschema } from "@/models/schema";
import { zodResolver } from "@hookform/resolvers/zod";


export default function Create() {

    const router = useRouter();

    async function dashboard() {
        router.push("/dashboard");
    }

    async function createclass(data: formdata) {
        console.log('form data submitted:', data);


        const user = auth.currentUser;
        const uid = user!.uid;

        const generate = await httpsCallable(fxns, "generateClassId");
        const cid = (await generate()).data as { id: string };

        const classdata = {
            classid: cid.id,
            classname: data.classname,
            description: data.description,
            owner: {
                uid: uid,
                email: user!.email,
                name: user!.displayName
            },
            admin: [],
            students: [],
            questions: []
        }


        try {
            const docRef = await addDoc(collection(db, "classes"), classdata);
            console.log("Document written with ID: ", docRef.id);
            router.push("/dashboard");

        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }

    const { register, handleSubmit, setError, formState: { errors } } = useForm<formdata>({
        resolver: zodResolver(matchschema)
    });

    return (
        <>
            <main className={s.createclass}>
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
            </main>
        </>
    );
};
