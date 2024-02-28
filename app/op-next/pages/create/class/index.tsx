import Navbar from "@/layout/navbar/navbar"
import React from "react"

import styles from "./create.class.module.scss"

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseconfig";

import { useRouter } from "next/router";

export default function CreateClass() {

    const router = useRouter();


    async function createclass() {
        // in the document classes in firebase, create a new class
        const user = auth.currentUser;
        const uid = user!.uid;

    }

    return (
        <div>
            <Navbar path={"Create class /"}/>
            <h1>Create Class</h1>
        </div>
    )
}