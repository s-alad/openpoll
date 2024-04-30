import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Poll, { getCorrectPollType } from '@openpoll/packages/models/poll';
import { doc, collection, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';
import { useAuth } from '@/context/authcontext';
import s from "./gradebook.module.scss";
import { onAuthStateChanged } from 'firebase/auth';
import MCPoll from '@openpoll/packages/models/poll/mc';
import ShortPoll from '@openpoll/packages/models/poll/short';
import AttendancePoll from '@openpoll/packages/models/poll/attendance';
import OrderPoll from '@openpoll/packages/models/poll/ordering';
import MatchPoll from '@openpoll/packages/models/poll/matching';

interface Student {
    name: string;
    email: string;
    grade: number;
};

interface StudentsMap {
    [key: string]: Student;
}

export default function gradebook() {
    const router = useRouter();
    const classid = router.query.classid;
    const { user } = useAuth();

    const [totalCorrectAnswers, setTotalCorrectAnswers] = useState<number>(0);
    const [Sstudents, setStudents] = useState<StudentsMap>({});
    const [Spolls, setPolls] = useState<(MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll)[]>([]);

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
                    const studentItem: Student = { name: data.name, email: data.email, grade: 0.0 };
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


        let openpolls: (MCPoll | ShortPoll | AttendancePoll | OrderPoll | MatchPoll)[] = []
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
        let totalcorrect = 0
        for (let poll of openpolls) {
            if (poll.type == "mc") {
                totalcorrect += 1;
                const mcPoll = poll as MCPoll;
                for (let response in mcPoll.responses) {
                    console.log(response);
                    console.log(students)
                    if (mcPoll.responses[response].correct) {
                        students[response].grade += 1;
                    }
                }
            }
            else if (poll.type == "short") {}
        }
        setTotalCorrectAnswers(totalcorrect);
    }


    //function to convert to csv format
    function convertToCSV(data: { [x: string]: any; }) {
        const csvRows = [];
        // Headers
        csvRows.push('Name,Email,Grade');
        // Data
        Object.keys(data).forEach((key) => {
            const student = data[key];
            csvRows.push(`${student.name},${student.email},${student.grade}`);
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
                await process()
            }
        });

        return () => unsubscribe();
    }, [classid]);

    return (
        <div className={s.gradebook}>
            <div>
                <h1>Gradebook for Class: {classid}</h1>
                <button onClick={downloadCSV} className={s.downloadButton}>Download CSV</button>
                <table className={s.gradebookTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(Sstudents).map((studentId) => (
                            <tr key={studentId}>
                                <td>{Sstudents[studentId].name}</td>
                                <td>{Sstudents[studentId].email}</td>
                                <td>{Sstudents[studentId].grade} / {totalCorrectAnswers}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}