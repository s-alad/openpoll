import React, { useState, useEffect } from "react";
import Classroom from "@/models/class";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";
import { db, auth } from "../../firebase/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import s from "./grades.module.scss";
import Link from "next/link";
import {
  faUser,
  faHome,
  faPlus,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Class {
  cid: string;
  class: Classroom;
}

export default function Grades() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState<Class[]>([]);

  async function getEnrolled() {
    console.log("Getting enrolled classes");
    setLoading(true);
    try {
      const user = auth.currentUser;

      const userRef = doc(db, "users", user!.email!);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("user document data:", userSnap.data());
        // Get the array of enrolled class IDs
        const enrolledClasses: string[] = userSnap.data().enrolled || [];

        // Fetch each class using its ID
        const classPromise = enrolledClasses.map((classId) =>
          getDoc(doc(db, "classes", classId)),
        );
        const classSnapshots = await Promise.all(classPromise);

        // Map each class to its ID
        const newClasses = classSnapshots.map((doc) => {
          const data = doc.data();
          console.log(data, "data");
          const cid = doc.id;
          return { cid, class: data as Classroom };
        });
        setEnrolled(newClasses);
      } else {
        console.error("User does not exist");
      }
    } catch (e) {
      console.error("Error getting enrolled classes", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getEnrolled();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={s.home}>
      <main className={s.main}>
        <div className={s.classes}>
          <div className={s.details}>
            <h2>classes i'm taking</h2>
          </div>
          {enrolled.map((classData, index) => (
            <div className={s.class} key={index}>
              <div className={`${s.trap} ${s.yellow}`}>
                <span>{classData.cid.substring(0, 6)}</span>
              </div>
              <div className={`${s.content} ${s.yellow}`}>
                <div className={s.info}>
                  <div className={s.code}>{classData.class.classname}</div>
                  <div className={s.name}>{classData.class.description}</div>
                  <div className={s.teacher}>{classData.class.owner.name}</div>
                </div>
                <div className={s.actions}>
                  <Link
                    href={{
                      pathname: "/grades/" + classData.cid,
                    }}
                  >
                    <div className={s.join}>enter</div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
