import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseconfig';
import { useAuth } from "@/context/authcontext";
import s from './classGrades.module.scss';

interface Question {
    question: string;
    options: {
        option: string;
        letter: string;
    }[];
    responses: string[];
    answers: string[];
    isCorrect: boolean;
}

export default function index() {
    const router = useRouter();
    const pollId = router.query.question;
    const classid = router.query.classid;
    const { user } = useAuth();

    const [question, setQuestion] = useState<Question>();
    

    async function getQuestion() {
        console.log('get question');
        const pollRef = doc(db, "classes", classid as string, "polls", pollId as string);
        
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const uid = currentUser.uid;
            
            const docSnap = await getDoc(pollRef);
            const pollData = docSnap.data();

            console.log(pollData);

            if (pollData) {
                // Initialize default user response info
                let userResponseInfo: Question = {
                    question: pollData.question,
                    responses: [],
                    answers: pollData.answerkey,
                    isCorrect: false,
                    options: pollData.options,
                };

                const userResponseEntry = Object.entries(pollData.responses || {}).find(
					([option, userResponses]) => {
						return option === currentUser.uid;
					},
				);

                console.log(userResponseEntry, "userResponseEntry");
                if (userResponseEntry) {
					userResponseInfo.responses = userResponseEntry[1].response;
					userResponseInfo.isCorrect = userResponseEntry[1].correct;
				}

                userResponseInfo.isCorrect = userResponseInfo.responses.includes(userResponseInfo.answer);

                setQuestion(userResponseInfo);
            }
             
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && classid) {
            getQuestion();
            
          }
        });
    
        return () => unsubscribe();
      }, [pollId]);


      return (
        <div className={s.grades}>
            {question && (
                <div className={s.classGrades}>
                    <h1>{question.question}</h1>
                    {question.options.map((option, index) => {
                    const isUserResponse = question.responses.includes(option.letter);
                    const isCorrect = question.answer.includes(option.letter);
                    const optionClasses = `${s.answer} ${isUserResponse ? isCorrect ? s.correct : s.incorrect : isCorrect ? s.correct : ''}`;

                    return (
                        <div key={index} className={optionClasses}>
                            <p>{option.letter}: {option.option}</p>
                        </div>
                    );
                })}
                <p>Your answer is {question.isCorrect ? 'correct' : 'incorrect'}.</p>
                </div>
            )}
        </div>
    );
}
