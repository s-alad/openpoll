import React, { useState, useEffect } from "react";
import Classroom from "@/models/class";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";
import { db, auth } from "../../../../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDocs, collection } from "firebase/firestore";
import s from "./grades.module.scss";
import Link from "next/link";
import Poll from "@/models/poll";

interface PollAndId {
  poll: Poll;
  id: string;
}

interface PollAndAnswer {
  pollId: string;
  response: string;
  answers: string;
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
    console.log("extractAndCheckAnswers");
    try {
      const user = auth.currentUser;
      const uid = user!.uid;
      console.log(uid, "current id");

      let results: PollAndAnswer[] = [];

      console.log(openpolls, "openpolls");
      console.log("hit1");
      openpolls.forEach((pollAndId) => {
        const { poll, id: pollId } = pollAndId;

        console.log(poll, "hit");

        const correctAnswers = new Set(poll.answers); // Assuming 'poll.answers' is an array of correct answer options (e.g., ['A'])

        let userResponseInfo = {
          pollId,
          response: "",
          answers: poll.answers.join(", "),
          isCorrect: false,
        };

        Object.entries(poll.responses || {}).forEach(
          ([option, userResponses]) => {
            const responses = userResponses as { [uid: string]: string };

            if (responses[uid]) {
              userResponseInfo.response = option; // Save the user's response
              userResponseInfo.isCorrect = correctAnswers.has(option); // Check correctness
              console.log(userResponseInfo.response, "response");
            }
          },
        );

        results.push(userResponseInfo);
      });

      // Update the state with the user's responses and correctness
      setStudentAnswers(results);
      console.log(results, "results");
    } catch (e) {
      console.error("Error while checking answers: ", e);
    }
  }

  

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      if (classid) {
        getPolls();
        extractAndCheckAnswers(); 
    }
    }
  
    return () => {
      unsubscribe();
    };

}, [classid]);


  // useEffect(() => {
  //   if (openpolls.length > 0) {
  //     extractAndCheckAnswers();
  //   }
  // }, [openpolls]);


  return <div>ClassGrades</div>;
}
