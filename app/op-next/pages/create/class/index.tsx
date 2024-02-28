import Navbar from "@/layout/navbar/navbar"

import styles from "./create.class.module.scss"

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseconfig";

import { useRouter } from "next/router";
import { addDoc, collection } from "firebase/firestore";

// index.tsx
import React, { useState, FormEvent } from 'react';

interface ClassData {
    classname: string;
    description: string;
}

/* async function addClassToDb (form: any) {
    const user = auth.currentUser;
    const docRef = db.collection("classes").doc();
    docRef.set({
        name: user,
        description: form.description,
        admin: [],
        students: [],
        questions: []
    });
} */

export default function Create() {

    const router = useRouter();


    async function createclass() {
        const user = auth.currentUser;
        const uid = user!.uid;

        const classdata = {
            className: formData.className,
            description: formData.description,
            admin: [uid],
            students: [],
            questions: []
        }

        try {
            const docRef = await addDoc(collection(db, "classes"), classdata);
            console.log("Document written with ID: ", docRef.id);

        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }

    const [formData, setFormData] = useState<ClassData>({ classname: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    async function submit(e: FormEvent) {
        e.preventDefault();
        console.log('Form data submitted:', formData);
    };

    return (
        <>
            <Navbar path={"Create class /"} />
            <form onSubmit={createclass}>
                <div>
                    <label htmlFor="className">Class Name:</label>
                    <input
                        type="text"
                        id="className"
                        name="className"
                        value={formData.classname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Create Class</button>
            </form>
        </>
    );
};