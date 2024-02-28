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


export default function Create() {

    const router = useRouter();

    async function dashboard() {
        router.push("/dashboard");
    }


    async function createclass(e: FormEvent) {
        e.preventDefault();
        console.log('Form data submitted:', formData);


        const user = auth.currentUser;
        const uid = user!.uid;

        const classdata = {
            className: formData.classname,
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


    return (
        <>
            <Navbar path={"Create class /"} />
            <form onSubmit={createclass}>
                <div>
                    <label>Class Name:</label>
                    <textarea
                        id="className"
                        name="className"
                        value={formData.classname}
                        onChange={(e) => setFormData({ ...formData, classname: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" onClick={dashboard}>Create Class</button>
            </form>
        </>
    );
};