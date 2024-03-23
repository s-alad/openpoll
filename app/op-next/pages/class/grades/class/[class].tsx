import React, { useState, useEffect } from "react";
import Classroom from "@/models/class";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";
import { db, auth } from "../../../../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import Link from "next/link";
import Poll from "@/models/poll";

interface PollAndId {
  poll: Poll;
  id: string;
}

interface PollAndAnswer {
  pollId: string;
  question: string;
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
    // collection classes - document class id - collection polls
    console.log("get polls");
    const classref = doc(db, "classes", classid as string);
    console.log(classref);
    const pollsref = collection(classref, "polls");

    try {
      const snapshot = await getDocs(pollsref);
      let openpolls: PollAndId[] = [];
      snapshot.forEach((doc) => {
        const pid = doc.id;
        const data = doc.data() as Poll;
        if (!data.classid) return;
        openpolls.push({ poll: data, id: pid });
      });
      setOpenpolls(openpolls);
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
    <div>
      { studentAnswers.length > 0 ? (
        <div>
          <h1>Class Grades</h1>
          <div>
            {studentAnswers.map((poll, index) => (
              <div key={index}>
                <h2>{poll.question}</h2>
                <p>Responses: {poll.responses}</p>
                <p>Correct Answers: {poll.answers.join(", ")}</p>
                <p>Correct: {poll.isCorrect ? "Yes" : "No"}</p>
              </div>
            ))}
            </div>
            </div>
      ) : (
        <h1>No grades</h1>
      )}
   
          
    </div>
  );
}
