import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Classroom from '@/models/class';
import Poll from '@/models/poll';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';
import { useAuth } from '@/context/authcontext';
import s from "./gradebook.module.scss";
import { onAuthStateChanged } from 'firebase/auth';

interface Student {
    name: string;
    email: string;
    grade: number;
};

interface StudentsData {
    [key: string]: Student;
}

export default function gradebook() {
    const router = useRouter();
    const { class: classId } = router.query;
    const { user } = useAuth();

    const [authorized, setAuthorized] = useState(false);
    const [students, setStudents] = useState<StudentsData>({});
    const [polls, setPolls] = useState<Poll[]>([]);

    // Check if current user is the admin of the class
    async function checkAuthorization() {
        try {
            const classRef = doc(db, "classes", classId as string);
            const classSnapshot = await getDoc(classRef);

            if (classSnapshot.exists()) {
                const classData = classSnapshot.data() as Classroom;
                if (classData.owner.uid == user?.uid) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            }
        } catch (error) {
            console.error("Error fetching class");
        }

    };

    // Grab all students and initialize their grades to 0.0
    async function grabStudents() {
        try {
            const classRef = doc(db, "classes", classId as string);
            const studentRef = collection(classRef, "students");
            const snapshot = await getDocs(studentRef);
            let students: StudentsData = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                
                // Check if entry is not empty
                if (Object.keys(data).length != 0) {
                    const studentItem: Student = { name: data.name, email: data.email, grade: 0.0 };
                    students[doc.id] = studentItem;
                    console.log(data);
                }
            });

            setStudents(students);
        } catch (error) {
            console.error("Error grabbing student information");
        }
    };

    // Grab the polls
    async function getDonePolls() {
        const classRef = doc(db, "classes", classId as string);
        const pollsRef = collection(classRef, "polls");

        let openpolls: Poll[] = []

        try {
            const snapshot = await getDocs(pollsRef);
            snapshot.forEach((doc) => {
                const data = doc.data() as Poll;
                if (data.done) {
                    openpolls.push(data);
                }
            });

            setPolls(openpolls);
        } catch (error) {
            console.error("Error getting Polls");
        }
    };

    const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
    async function grade() {
        let tempStudents: StudentsData = { ...students };
        let numCorrectAnswers = 0;

        try {
            polls.forEach((poll) => {
                const answers = poll.answers;
                numCorrectAnswers += answers.length;
    
                answers.forEach((answer) => {
                    const correctResponses = poll.responses?.[answer];
    
                    if (correctResponses) {
                        const uids = Object.keys(correctResponses);
                        
                        uids.forEach((uid) => {
                            if (tempStudents[uid]) {
                                tempStudents[uid].grade += 1;
                            }
                        })
                    }
                });
            });
            
            setTotalCorrectAnswers(numCorrectAnswers);
            setStudents(tempStudents);
        } catch (error) {
            console.log("Error grading");
        }
    };
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && classId) {
            getDonePolls();
            grabStudents();
            setAuthorized(true);
          }
        });
    
        return () => unsubscribe();
      }, [classId]);
    
      useEffect(() => {
        if (polls.length > 0) {
          grade();
        }
      }, [polls]);

    return (
        <div className={s.gradebook}>
            {authorized ? (
                <div>
                    <h1>Gradebook for Class: {classId}</h1>
                    <table className={s.gradebookTable}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Grade</th>
                        </tr>
                        {Object.keys(students).map((studentId) => (
                            <tr key={studentId}>
                                <th>{students[studentId].name}</th>
                                <th>{students[studentId].email}</th>
                                <th>{students[studentId].grade}</th>
                            </tr>
                        ))}

                    </table>
                </div>
            ) : (
                <h1>Unauthorized to view this gradebook</h1>
            )}
        </div>
    );
}