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
import s from "./question.module.scss";
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
    const [userResponse, setUserResponse] = useState<string[]>([]);

    

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
            setUserResponse(userResponse.response);
        } else if (poll.type === "short") {
            const shortPoll = poll as ShortPoll;
            const correct = shortPoll.responses[uid].response.toLowerCase() === shortPoll.answerkey?.toLowerCase();
            setCorrectAnswer(correct);
            setUserResponse([shortPoll.responses[uid].response]);
        } else if (poll.type === "order") {
            const orderPoll = poll as OrderPoll;
            const userResponse = orderPoll.responses[uid];
            if (!userResponse) return;
            const correct = userResponse.correct;
            setCorrectAnswer(correct);
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
            { openpoll && (
                <div className={s.classGrades}>
                    <h1>{openpoll.question}</h1>
                    {openpoll && (
                        <div className={s.classGrades}>
                            { openpoll.type === "mc" ? (
                            <div>
                                {options.map((option, index) => {
                                    const isUserResponse = userResponse.includes(option.letter);
                                    const isCorrect = option.letter === openpoll.answerkey?.[0];
                                    const optionClasses = `${s.answer} ${isCorrect ? s.correct : isUserResponse ? s.incorrect : ''}`;

                                    return (
                                        <div key={index} className={optionClasses}>
                                            <p>{option.letter}: {option.option}</p>
                                        </div>
                                    );
                                })}
                                <p>Your answer is {correctAnswer ? 'correct' : 'incorrect'}.</p>
                            </div>
                            ) : (
                                openpoll.type === "short" && (
                                    <div>
                                        <p>The correct answer was {openpoll.answerkey as string}.</p>
                                        <p>Your answer was {userResponse[0]}.</p>
                                        <p>Your answer is {correctAnswer ? 'correct' : 'incorrect'}.</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}