import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Poll, { getCorrectPollType, xPoll } from '@openpoll/packages/models/poll';
import { doc, collection, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '@openpoll/packages/config/firebaseconfig';
import { useAuth } from '@/context/authcontext';
import s from "./gradebook.module.scss";
import { onAuthStateChanged } from 'firebase/auth';
import MCPoll from '@openpoll/packages/models/poll/mc';
import ShortPoll from '@openpoll/packages/models/poll/short';
import AttendancePoll from '@openpoll/packages/models/poll/attendance';
import OrderPoll from '@openpoll/packages/models/poll/ordering';
import MatchPoll from '@openpoll/packages/models/poll/matching';
import { getClassnameFromId } from '@openpoll/packages/models/class';
import TrueFalsePoll from '@openpoll/packages/models/poll/truefalse';

interface Student {
    name: string;
    email: string;
    mcGrade: number;
    shortGrade: number;
    tfGrade: number;
    orderGrade: number;
    attendance: number;
};

interface StudentsMap {
    [key: string]: Student;
}

export default function gradebook() {
    const router = useRouter();
    const classid = router.query.classid;
    const { user } = useAuth();

    const [totalMCAnswers, setTotalMCAnswers] = useState<number>(0);
    const [totalAttendence, setTotalAttendnence] = useState<number>(0);
    const [totalShort, setTotalShort] = useState<number>(0);
    const [totalTF, setTotalTF] = useState<number>(0);
    const [totalOrder, setTotalOrder] = useState<number>(0);

    const [Sstudents, setStudents] = useState<StudentsMap>({});
    const [Spolls, setPolls] = useState<xPoll[]>([]);
    const [className, setClassName] = useState<string>("")


    // Grab all students and initialize their grades to 0.0
    async function process() {

        let students: StudentsMap = {};
        try {
            const classRef = doc(db, "classes", classid as string);
            const studentRef = collection(classRef, "students");
            const snapshot = await getDocs(studentRef);

            snapshot.forEach((doc) => {
                const data = doc.data();

                // Check if entry is not empty
                if (Object.keys(data).length != 0) {
                    const studentItem: Student = {
                        name: data.name, 
                        email: data.email, 
                        mcGrade: 0.0, 
                        shortGrade: 0.0, 
                        tfGrade: 0.0,
                        orderGrade: 0.0,
                        attendance: 0
                    };
                    students[data.uid] = studentItem;
                    console.log(data);
                }
            });

            
        } catch (error) {
            console.error("Error grabbing student information");
        }
        setStudents(students);


        const classRef = doc(db, "classes", classid as string);
        const pollsRef = collection(classRef, "polls");

        let openpolls: xPoll[] = []
        try {
            const donePollsQuery = query(pollsRef, where("done", "==", true));
            const snapshot = await getDocs(donePollsQuery);

            snapshot.forEach((doc) => {
                const data = doc.data() as Poll;
                let poll = getCorrectPollType(data);

                if (!poll) {
                    console.error("Error getting poll type");
                    return;
                }

                console.log(poll);
                openpolls.push(poll);
            });

            setPolls(openpolls);
        } catch (error) {
            console.error("Error getting Polls");
        }

        console.log(openpolls);

        // Process Record and grade polls here
        let mcCorrectTotal = 0;
        let totalAttendence = 0;
        let totalShort = 0;
        let totalTF = 0;
        let totalOrder = 0;
        for (let poll of openpolls) {
            if (poll.type == "mc") {
                mcCorrectTotal += 1;
                const mcPoll = poll as MCPoll;
                for (let response in mcPoll.responses) {
                    console.log(response);
                    console.log(students)
                    if (mcPoll.responses[response].correct) {
                        if (students[response]) {students[response].mcGrade += 1;}
                    }
                }
            }
            else if (poll.type == "attendance") {
                totalAttendence += 1;
                const attendencePoll = poll as AttendancePoll;
                for (let response in attendencePoll.responses) {
                    // If it exists
                    if (response) {
                        if (students[response]) {students[response].attendance += 1;}
                    }
                }
            }
            else if (poll.type == "short") {
                totalShort += 1
                const shortPoll = poll as ShortPoll;
                for (let response in shortPoll.responses) {
                    if (shortPoll.responses[response].correct) {
                        if (students[response]) {students[response].shortGrade += 1;}
                    }
                }
            } 
            else if (poll.type == "tf") {
                totalTF += 1
                const trueFalsePoll = poll as TrueFalsePoll;
                for (let response in trueFalsePoll.responses) {
                    if (trueFalsePoll.responses[response].correct) {
                        if (students[response]) {students[response].tfGrade += 1;}
                    }
                }
            }
            else if (poll.type == "order") {
                totalOrder += 1;
                const orderPoll = poll as OrderPoll;
                for (let response in orderPoll.responses) {
                    if (orderPoll.responses[response].correct) {
                        if (students[response]) {students[response].orderGrade += 1;}
                    }
                }
            }
        }
        setTotalAttendnence(totalAttendence);
        setTotalMCAnswers(mcCorrectTotal);
        setTotalShort(totalShort);
        setTotalTF(totalTF);
        setTotalOrder(totalOrder);
    }


    //function to convert to csv format
    function convertToCSV(data: { [x: string]: any; }) {
        const csvRows = [];
        // Headers
        csvRows.push('Name,Email,Attendence,MC Grade, Short Grade, T/F Grade, Order Grade');
        // Data
        Object.keys(data).forEach((key) => {
            const student = data[key];
            csvRows.push(`${student.name},${student.email},${student.attendance},${student.mcGrade},${student.shortGrade},${student.tfGrade},${student.orderGrade}`);
        });
        return csvRows.join('\n');
    }

    //function to download the csv file
    function downloadCSV() {
        const csvData = convertToCSV(Sstudents);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gradebook-${classid}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && classid) {
                await process();
                const className = getClassnameFromId(classid as string);
                className.then((name) => setClassName(name));
            }
        });

        return () => unsubscribe();
    }, [classid]);

    return (
        <div className={s.gradebook}>
            <div>
                <h1>Gradebook for Class: {className}</h1>
                <button onClick={downloadCSV} className={s.downloadButton}>Download CSV</button>
                <table className={s.gradebookTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Attendence</th>
                            <th>MC Grade</th>
                            <th>Short Grade</th>
                            <th>T/F Grade</th>
                            <th>Order Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(Sstudents).map((studentId) => (
                            <tr key={studentId}>
                                <td>{Sstudents[studentId].name}</td>
                                <td>{Sstudents[studentId].email}</td>
                                <td>{Sstudents[studentId].attendance} / {totalAttendence} ({(Sstudents[studentId].attendance / totalAttendence) * 100}%)</td>
                                <td>{Sstudents[studentId].mcGrade} / {totalMCAnswers} ({(Sstudents[studentId].mcGrade / totalMCAnswers) * 100}%)</td>
                                <td>{Sstudents[studentId].shortGrade} / {totalShort} ({(Sstudents[studentId].shortGrade / totalShort) * 100}%)</td>
                                <td>{Sstudents[studentId].tfGrade} / {totalTF} ({(Sstudents[studentId].tfGrade / totalTF) * 100}%)</td>
                                <td>{Sstudents[studentId].orderGrade} / {totalOrder} ({(Sstudents[studentId].orderGrade / totalOrder) * 100}%)</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}