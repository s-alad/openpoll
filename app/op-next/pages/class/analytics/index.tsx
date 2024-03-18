import s from './analytics.module.scss';
import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Poll from "@/models/poll";
import { PieChart, BarChart } from '@mui/x-charts';

// Value: # of responses, Label: Answers
const pollAnswer1 = [
    {label: "A", value: 5},
    {label: "B", value: 5},
    {label: "C", value: 5},
    {label: "D", value: 5},
]

const pollAnswer2 = [
    {label: "A", value: 10},
    {label: "B", value: 5},
    {label: "C", value: 5},
    {label: "D", value: 5},
]

const pollAnswer3 = [
    {label: "A", value: 10},
    {label: "B", value: 5},
    {label: "C", value: 5},
    {label: "D", value: 5},
]

// Place all answers here
const allAnswers = [
    pollAnswer1,
    pollAnswer2,
    pollAnswer3
]

const renderPieChartViews = () => {
    return allAnswers.map((data, index) => (
        <PieChart
            key={index}
            series={[
                {
                    arcLabel: (item) => `${item.label} (${item.value})`,
                    data
                }
            ]}
            width={500}
            height={400}
        />
    ))
}

const renderBarChartViews = () => {
    return allAnswers.map((data, index) => (
        <BarChart
            key={index}
            dataset={data}
            yAxis={[{ scaleType: "band", dataKey: "label"}]}
            series={[{ dataKey: "value", label: "# of Answers"}]}
            width={500}
            height={400}
            layout="horizontal"
            colors={["#4036ee"]}
        />
    ));
}

export default function analytics() {
    const router = useRouter();
    const classid = router.query.classid;
    
    // 0 = Pie Chart, 1 = Bar Chart, 2 = Scatter
    const analyticsView = 1;

    const [openpolls, setOpenpolls] = useState<Poll[]>([]);

    async function getpolls() {
        // collection classes - document class id - collection polls
        const classref = doc(db, "classes", classid as string);
        console.log(classref);
        const pollsref = collection(classref, "polls");

        try {
            const snapshot = await getDocs(pollsref);
            let openpolls: Poll[] = [];
            snapshot.forEach((doc) => {
                const pid = doc.id;
                const data = doc.data() as Poll;
                if (!data.classid) return;

                openpolls.push(data);  
            });
            setOpenpolls(openpolls);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }


    //wait for router to load
    useEffect(() => {
        if (classid) {
            getpolls();
        }
    }, [classid]);

    return(
        <>
        <div className={s.class}>
            <div className={s.classAverage}>
            {/* Place whole averages here */}
            </div>

            <div className={s.pollAnalyticsView}>
                {/* Place Poll views here */}
                {analyticsView == 0 && renderPieChartViews()}
                {analyticsView == 1 && renderBarChartViews()}
            </div>
        </div>
        </>
    );
}