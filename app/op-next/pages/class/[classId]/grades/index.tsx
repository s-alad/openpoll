import { useAuth } from "@/context/authcontext";
import Poll from "@/models/poll";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase/firebaseconfig";
import s from "./classGrades.module.scss";
import Link from "next/link";

interface PollAndId {
  poll: Poll;
  id: string;
}

interface PollAndAnswer {
  pollId: string;
  question: string;
  options: {
    letter: string;
    option: string;
  }[];
  responses: string;
  answers: string[];
  isCorrect: boolean;
}

export default function ClassGrades() {
  const [loading, setLoading] = useState(false);

  // get the class id from the url
  const router = useRouter();
  const { classId: classid } = router.query;
  const { user } = useAuth();

  const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<PollAndAnswer[]>([]);
  const [numCorrect, setNumCorrect] = useState(0); // Number of correct answers used as an integer to display how many questions the student got correct
  const [totalQuestions, setTotalQuestions] = useState(0); // Total number of questions in the poll
  const [totalGrade, setTotalGrade] = useState(0); // Total grade of the student

  async function getPolls() {
    setLoading(true); 
    const classRef = doc(db, "classes", classid as string);
    const pollsRef = collection(classRef, "polls");
    try {
      const snapshot = await getDocs(pollsRef);
      
      let completedPolls: PollAndId[] = [];
      snapshot.forEach((doc) => {
        const pid = doc.id;
        const data = doc.data() as Poll;
        // Check if the poll is marked as done before adding it to the array
        
        if (data.done) {
          completedPolls.push({ poll: data, id: pid });
        }
      });
      setOpenpolls(completedPolls);
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  
    setLoading(false);
  }  

  async function extractAndCheckAnswers() {
    console.log("Extracting and checking answers");
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No current user found");
        return;
      }
      const uid = currentUser.uid;

      let correctCount = 0;
  
      const results: PollAndAnswer[] = openpolls.map(pollAndId => {
        const { poll, id: pollId } = pollAndId;
        const correctAnswersSet = new Set(poll.answers);

  
        // Initialize default user response info
        let userResponseInfo: PollAndAnswer = {
          question: poll.question,
          pollId,
          responses: "",
          answers: poll.answers,
          isCorrect: false,
          options: poll.options,
        };
  
        // Find the user's response among the poll responses
        const userResponseEntry = Object.entries(poll.responses || {}).find(
          ([option, userResponses]) => {
            const responses = userResponses as { [uid: string]: string };
            return responses[uid];
          }
        );
        
  
        if (userResponseEntry) {
          const [responseOption] = userResponseEntry;
          userResponseInfo.responses = responseOption; // The option the user chose
          userResponseInfo.isCorrect = correctAnswersSet.has(responseOption); 
          if (userResponseInfo.isCorrect) {
            correctCount++; // Increment local correct count
          }
        }
  
        return userResponseInfo;
      });
  
      setStudentAnswers(results); // Save the results to the state
      setNumCorrect(correctCount); 
      setTotalQuestions(openpolls.length);
      setTotalGrade((correctCount / openpolls.length) * 100);
    } catch (e) {
      console.error("Error while checking answers: ", e);
    }
  }

  console.log(numCorrect, "numCorrect")
  console.log(totalQuestions, "totalQuestions")
  console.log(totalGrade, "totalGrade")
  console.log(studentAnswers, "studentAnswers")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && classid) {
        getPolls();
        
      }
    });

    return () => unsubscribe();
  }, [classid]);

  useEffect(() => {
    if (openpolls.length > 0) {
      extractAndCheckAnswers();
    }
  }, [openpolls]); // Only run the effect when openpolls changes


  return (
    <div className={s.grades}>
      {studentAnswers.length > 0 ? (
        <>
          <div className={s.gradeSummary}>
            <span>Total Correct: {numCorrect} </span>
            <span>Total Questions: {totalQuestions} </span>
            <span>Grade: {totalGrade} </span>
          </div>
          <div className={s.classGrades}>
            <h1 className={s.question}>Class Grades</h1>
            {studentAnswers.map((poll, index) => (
              <div key={index}>
                <Link
                      href={{
                        pathname: `/class/${classid}/grades/${poll.pollId}`,
                        query: { id: classid },
                      }}> 
                      {poll.question}
                </Link>
                <h2>Question: {poll.question}</h2>
                {poll.options.map((option, index) => {
                  const isUserResponse = poll.responses === option.letter;
                  const isCorrect = poll.answers.includes(option.letter);
                  return (
                    <div key={index}
                        className={`${s.answer} ${isUserResponse ? isCorrect ? s.correct : s.incorrect : isCorrect ? s.correct : ''}`}>
                      <span>{option.letter}: {option.option}</span>
                      {isUserResponse && <span className={s.answerIndicator}></span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <h1>No grades</h1>
      )}
    </div>
  );  
  
}
