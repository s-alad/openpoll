import { useAuth } from "@/context/authcontext";
import Poll from "@/models/poll";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp, collection, doc, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase/firebaseconfig";
import s from "./classGrades.module.scss";
import Link from "next/link";
import Image from "next/image";
import { AppBar, Tabs, Tab, Box, Typography } from "@mui/material";
import TopSection from "@/components/grades/topSection/topSection";

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
  responses: string[];
  answers: string[];
  isCorrect: boolean;
  answered?: boolean;
}

interface PollAttendance {
  pollId: string;
  date: Timestamp;
  attended: boolean;
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
  const [studentAttendance, setStudentAttendance] = useState<PollAttendance[]>([]);
  const [attendedCount, setAttendedCount] = useState(0);

  

  // Handler for changing tabs
  const [value, setValue] = useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

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

  async function extractPolls() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No current user found");
        return;
      }
      const uid = currentUser.uid;

      let correctCount = 0;
      let attendanceCount = 0;

      const attendancePolls = openpolls.filter(poll => poll.poll.type === "attendance");
      const questionPolls = openpolls.filter(poll => poll.poll.type === "mc");

      console.log(attendancePolls, "attendance polls")
      console.log(questionPolls, "question polls")

      const attendanceResults: PollAttendance[] = attendancePolls.map((pollAndId) => {
        const { poll, id: pollId } = pollAndId;

        let userAttendanceInfo: PollAttendance = {
          pollId,
          date: poll.date,
          attended: false,
        };

        const userAttendanceEntry = Object.entries(poll.responses || {}).find(
          ([uid, attended]) => {
            return uid === currentUser.uid;
          },
        );

        if (userAttendanceEntry) {
          userAttendanceInfo.attended = true;
          attendanceCount++;
        }

        return userAttendanceInfo;
      });

      const MCresults: PollAndAnswer[] = questionPolls.map((pollAndId) => {
        const { poll, id: pollId } = pollAndId;
        const correctAnswersSet = new Set(poll.answers);

        // Initialize default user response info
        let userResponseInfo: PollAndAnswer = {
          question: poll.question,
          pollId,
          responses: [],
          answers: poll.answers,
          isCorrect: false,
          options: poll.options,
          answered: false,
        };

        // Find the user's response among the poll responses
        const userResponseEntry = Object.entries(poll.responses || {}).find(
          ([option, userResponses]) => {
            const responses = userResponses as { [uid: string]: string };
            return responses[uid];
          },
        );

        if (userResponseEntry) {
          const [responseOption] = userResponseEntry;
          userResponseInfo.responses = [responseOption]; // The option the user chose
          userResponseInfo.isCorrect = correctAnswersSet.has(responseOption);
          userResponseInfo.answered = true;
          if (userResponseInfo.isCorrect) {
            correctCount++; // Increment local correct count
          }
        }
        

        return userResponseInfo;
      });

      setAttendedCount(attendanceCount);
      setStudentAttendance(attendanceResults);
      setStudentAnswers(MCresults); // Save the results to the state
      setNumCorrect(correctCount);
      setTotalQuestions(questionPolls.length);
      setTotalGrade(
        Math.round((correctCount / openpolls.length) * 100 * 10) / 10,
      );
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
      extractPolls();
    }
  }, [openpolls]); // Only run the effect when openpolls changes


  return (
    <div>
      {user ? (
        <>
          <div className={s.gradebookContainer}>
            <h1
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Gradebook
            </h1>
            <TopSection 
              totalGrade={totalGrade}
              attendedCount={attendedCount}
              studentAttendanceLength={studentAttendance.length}
              numCorrect={numCorrect}
              totalQuestions={totalQuestions}
            />
            {/* Section for stats and images */}
            <div className={s.studentStats}>
              <div className={s.statItem}>
                <Image
                  src="/person.svg"
                  alt="person"
                  width={20}
                  height={20}
                  className={s.image}
                />
                <h2 className={s.statText}>{studentAttendance.filter(attend => attend.attended).length}/{studentAttendance.length}</h2>
                {/* Placeholder */}
              </div>
              <div className={s.statItem}>
                <Image
                  src="/chat_box.svg"
                  alt="chat box"
                  width={24}
                  height={24}
                  className={s.image}
                />
                <h2 className={s.statText}>
                {studentAnswers.filter(answer => answer.answered).length}/{totalQuestions} Questions Answered
                </h2>
              </div>
              <div className={s.statItem}>
                <Image
                  src="/checkmark.svg"
                  alt="check"
                  width={20}
                  height={20}
                  className={s.image}
                />
                <h2 className={s.statText}>{numCorrect} Correct</h2>
              </div>
            </div>
            {/* Question Section */}
            <Box sx={{ width: "100%" }}>
              <AppBar
                position="static"
                color="default"
                sx={{ background: "transparent", boxShadow: "none" }}
              >
                <Tabs
                  value={value}
                  onChange={handleChange}
                  TabIndicatorProps={{
                    style: {
                      height: "4px",
                      backgroundColor: "red",
                      color: "red ",
                    },
                  }}
                  sx={{
                    ".Mui-selected": {
                      color: "red",
                    },
                  }}
                >
                  <Tab label="Questions" />
                  <Tab label="Attendance" />
                </Tabs>
              </AppBar>
              <TabPanel value={value} index={0}>
                <div className={s.boxContainer}>
                  <div className={s.boxOverhead}>
                    <h2>Responses</h2>
                    <h2>Weight</h2>
                    <h2>Correctness</h2>
                    <h2>Total</h2>
                  </div>
                  <div className={s.questionsList}>
                    {studentAnswers.map((answer, index) => (
                      <div key={index} className={s.question}>
                        <div className={s.responseColumn}>
                          <Image
                            src="/chat_box.svg"
                            alt="chat box"
                            width={20}
                            height={20}
                          />
                          <div className={s.textDetails}>
                            <Link
                              href={`/class/${classid}/grades/${answer.pollId}`}
                              passHref
                              className={s.questionLink}
                            >
                              <h2 className={s.questionText}>
                                {answer.question}
                              </h2>
                            </Link>
                            <Typography variant="body2" className={s.correctAnswer}>
                              Correct answer is {answer.answers[0]}
                            </Typography>
                          </div>
                        </div>
                        <div className={s.stat}>1/1</div>
                        <div className={s.stat}>{studentAnswers[index].isCorrect ? 
                            <Image
                              src="/checkmark.svg"
                              alt="check"
                              width={20}
                              height={20}
                              className={s.image}
                            /> : 
                            <Image
                            src="/x-mark.svg"
                            alt="x"
                            width={250}
                            height={25}
                            className={s.image}
                            />
                          }
                        </div>
                        <div className={s.stat}>1/1</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <div className={s.boxContainer}>
                  <div className={s.boxOverhead}>
                    <h2>Date</h2>
                    <h2>Attended</h2>
                  </div>
                  <div>
                    {studentAttendance.map((attendance, index) => (
                      <div key={index} className={s.question}>
                        <div className={s.responseColumn}>
                          
                          <div>
                            <h2>
                              {attendance.date.toDate().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </h2>
                          </div>
                        </div>
                        <div className={s.stat}>
                          {attendance.attended ? 
                            <Image
                              src="/checkmark.svg"
                              alt="check"
                              width={20}
                              height={20}
                              className={s.image}
                            /> : 
                            <Image
                            src="/x-mark.svg"
                            alt="check"
                            width={20}
                            height={20}
                            className={s.image}
                            />
                          }
                        </div>
                      </div>
                    ))}
                    </div>
                </div>
              </TabPanel>
            </Box>
          </div>
        </>
      ) : (
        <h1>No grades</h1>
      )}
    </div>
  );
}
