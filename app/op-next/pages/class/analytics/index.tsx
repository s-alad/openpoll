import s from './analytics.module.scss';
import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";
import { PieChart } from '@mui/x-charts';

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;

    // 0 = Pie Chart, 1 = Bar Chart, 2 = Scatter
    const analyticsView = 0
    
    const pollQuestions = [
        "Question 1",
        "Question 2",
        "Question 3"
    ]

    // Value: # of responses, Label: Answers
    const data = [
        {value: 5, label: "A"},
        {value: 10, label: "B"},
        {value: 10, label: "C"},
        {value: 10, label: "D"}
    ]

    const listPollAnswers = pollQuestions.map((pollQuestions) => {

    })

    return(
        <>
        <div className={s.class}>
            <div className={s.classAverage}>
            {/* Place whole averages here */}
            </div>

            <div className={s.pollAnalyticsView}>
                {/* Place Poll views here */}
                <PieChart 
                    series={[{data}]}
                    width={400}
                    height={200}
                />
            </div>
        </div>
        </>
    );
}