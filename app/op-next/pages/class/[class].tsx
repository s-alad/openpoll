import { useRouter } from 'next/router';
import React from 'react';

export default function Class() {

    // get the class id from the url
    const router = useRouter();

    const { class: classId } = router.query;


    return (
        <div>
            <h1>Class {classId}</h1>
        </div>
    )
}