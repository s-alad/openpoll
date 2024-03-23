import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faArrowLeftLong,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { collection, doc, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseconfig";
import Poll from "@/models/poll";
import { onAuthStateChanged } from "firebase/auth";
import Loader from "@/components/loader/loader";
import { useAuth } from "@/context/authcontext";

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
  const classid = router.query.class;
  console.log(classid, "classid");
  const { user } = useAuth();
  console.log(user, "user");

  const [openpolls, setOpenpolls] = useState<PollAndId[]>([]);

  const [studentAnswers, setStudentAnswers] = useState<PollAndAnswer[]>([]);

  async function getpolls() {
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
        console.log(pid, data);
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
      if (!user) {
        console.error("User not found");
        return;
      }
      const uid = user.uid;
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

  async function getGrades() {}

  //wait for router to load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (classid) {
          getpolls();
          extractAndCheckAnswers();
        }
      }
    })

    return () => {
        unsubscribe();
    }
  }, [classid]);

  return <div>ClassGrades</div>;
}
