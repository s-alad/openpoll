import React, { useState, useEffect } from "react";
import Classroom from "@/models/class";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";
import { db, auth } from "../../../../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import Link from "next/link";
import Poll from "@/models/poll";
import s from "./classGrades.module.scss";

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
  const { class: classid } = router.query;
  console.log(classid, "classid");
  const { user } = useAuth();
  console.log("user", user);

  const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<PollAndAnswer[]>([]);
  const [numCorrect, setNumCorrect] = useState(0); // Number of correct answers used as an integer to display how many questions the student got correct

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
      console.log(`Current user ID: ${uid}`);
  
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
        const userResponseEntry = Object.entries(poll.responses || {})
          .find(([_, userResponses]) => uid in userResponses);
  
        if (userResponseEntry) {
          const [responseOption] = userResponseEntry;
          userResponseInfo.responses = responseOption; // The option the user chose
          userResponseInfo.isCorrect = correctAnswersSet.has(responseOption); // Is the option correct?
        }
  
        return userResponseInfo;
      });
  
      setStudentAnswers(results); // Save the results to the state
      console.log(results, "Results after checking answers");
    } catch (e) {
      console.error("Error while checking answers: ", e);
    }
  }
  

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
        <div className={s.classGrades}>
          <h1 className={s.question}>Class Grades</h1>
          {studentAnswers.map((poll, index) => (
            <div key={index}>
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
      ) : (
        <h1>No grades</h1>
      )}
    </div>
  );  
  
}
