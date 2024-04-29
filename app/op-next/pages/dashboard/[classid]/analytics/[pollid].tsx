import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase/firebaseconfig";

export default function AdvancedAnalytics() {
    const router = useRouter()


    return (
        <div>
            Hello World
        </div>
    )
}