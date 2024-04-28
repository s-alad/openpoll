import { useAuth } from "@/context/authcontext";
import { auth, db } from '@/firebase/firebaseconfig';
import { getCorrectPollType } from '@/models/poll';
import MCPoll, { MCOptions } from '@/models/poll/mc';
import OrderPoll from '@/models/poll/ordering';
import ShortPoll from '@/models/poll/short';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import s from './classGrades.module.scss';
import { set } from "firebase/database";

export default function Question() {
    const router = useRouter();
    const pollId = router.query.question;
    const classid = router.query.classid;
    const { user } = useAuth();
    console.log(pollId, classid)

    const [openpoll, setOpenPoll] = useState<(MCPoll | ShortPoll | OrderPoll) | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<boolean>(false);
    const [options, setOptions] = useState<MCOptions>([]);

    

    async function getQuestion() {

        // get uid
        const uid = user?.uid;
        if (!uid) return;
        console.log("HITS HERE")
        const pollRef = doc(db, "classes", classid as string, "polls", pollId as string);

        const pollDoc = await getDoc(pollRef);
        const pollData = pollDoc.data();
        if (!pollData) return;
        setOpenPoll(pollData as MCPoll | ShortPoll | OrderPoll);
        console.log(pollData)
        console.log(openpoll)
        const poll = getCorrectPollType(pollData);
        if (!poll) return;
        if (poll.type === "mc") {
            const mcPoll = poll as MCPoll;
            setOptions(mcPoll.options);
            const userResponse = mcPoll.responses[uid];
            if (!userResponse) return;
            const correct = userResponse.correct;
            setCorrectAnswer(correct);
        } else if (poll.type === "short") {
            const shortPoll = poll as ShortPoll;
            const correct = shortPoll.responses[uid].response.toLowerCase() === shortPoll.answerkey?.toLowerCase();
            setCorrectAnswer(correct);
        } else if (poll.type === "order") {
            const orderPoll = poll as OrderPoll;
            const userResponse = orderPoll.responses[uid];
            if (!userResponse) return;
            const correct = userResponse.correct;
            setCorrectAnswer(correct);
        }
        console.log(poll);
        
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
            { openpoll && (
                <div className={s.classGrades}>
                    <h1>{openpoll.question}</h1>
                    {openpoll && (
                        <div className={s.classGrades}>
                            <h1>{openpoll.question}</h1>
                            {options.map((option, index) => {
                                const optionClasses = `${s.answer} ${correctAnswer ? s.correct : s.incorrect}`;

                                return (
                                    <div key={index} className={optionClasses}>
                                        <p>{option.letter}: {option.option}</p>
                                    </div>
                                );
                            })}
                            <p>Your answer is {correctAnswer ? 'correct' : 'incorrect'}.</p>
                        </div>
                    )}
                </div>
            )}
            {/* {question && (
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
            )} */}
        </div>
    );
}