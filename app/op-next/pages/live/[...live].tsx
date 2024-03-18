import { rdb } from "@/firebase/firebaseconfig";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { collection, doc, getDoc, query as q, where } from "firebase/firestore";
import { auth, db, fxns } from "../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import { BarChart } from '@mui/x-charts'
import { axisClasses } from '@mui/x-charts';
import Image from "next/image";
import { transferPollResults } from "../../../../firebase/functions/src/index";

interface LivePoll {
    active: boolean;
    done: boolean,
    options: {
        option: string;
        letter: string;
    }[];
    question: string;
    responses?: {
        [studentid: string]: string;
    }
}

type DatasetElementType = {
    [key: string]: string | number | Date | null | undefined;
}; // MUI X Charts expects this type for the dataset

export default function Live() {

    const router = useRouter();
    const { live } = router.query;

    const [livepoll, setLivepoll] = useState<LivePoll>();
    const [pollstatus, setPollstatus] = useState<boolean>(false);

    const [pollFinalStatus, setPollFinalStatus] = useState<boolean>(false);
    const [data, setData] = useState<DatasetElementType[]>([]);
    const [pollId, setPollId] = useState<string>("");
    const [correctAnswers, setCorrectAnswers] = useState<string>("");
    const [classId, setClassId] = useState<string>("");
    const [showAnswers, setShowAnswers] = useState<boolean>(false);

    useEffect(() => {
        if (livepoll?.options) {
          const newData = livepoll.options.map(option => {
            const responseCount = livepoll.responses?.[option.letter]
              ? Object.keys(livepoll.responses[option.letter]).length
              : 0;
            return {
              option: option.letter, 
              responses: responseCount, 
            } as unknown as DatasetElementType; // Cast each object to the expected type
          });
    
          setData(newData as DatasetElementType[]); // Cast the entire array to the expected type
        }
      }, [livepoll]); // Update the data whenever livepoll changes

      
    // const chartSetting = {
    //     bottomAxis: [{
    //         tick: {
    //             callback: function(value: any) {
    //                 return Number.isInteger(value) ? value : null;
    //             }
    //         },
    //     }],
    //     yAxis: [{
    //         scaleType: 'band',
    //         dataKey: 'option', 
    //     }],
    //     width: 800,
    //     height: 300,
    // };

    // Uses pollId and classId to get the correct answers from the database
    async function getCorrectAnswers(pollId: any) {
        // Make sure that 'pollId' is not empty
        if (!pollId) {
            console.log('Poll ID is undefined or empty.');
            return;
        }
    
        // Reference to the poll document in the 'polls' collection
        const pollDocRef = doc(db, "classes", classId,  "polls", pollId);
        console.log(pollDocRef, "pollDocRef")
        // Get the document from the database
        try {
            const docSnap = await getDoc(pollDocRef);
    
            if (docSnap.exists()) {
                const pollData = docSnap.data();
                const answers = pollData.answers;
                console.log(answers, "answers");
                setCorrectAnswers(answers[0]);
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    }

    const handleShowAnswers = async () => {
        // Only fetch answers if they haven't been fetched already
        if (correctAnswers.length === 0) {
            await getCorrectAnswers(pollId);
        }
        // Toggle the visibility of the answers
        setShowAnswers(prev => !prev);
    };

    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);
        console.log(pollsref, "pollsref");

        try {
            const snapshot = await get(pollsref);
            const poll = snapshot.val();
            if (!poll) return;

            const lp = poll[live![1]] as LivePoll;
            console.log(lp);

            setLivepoll(lp);
        } catch (e) { console.error("Error getting documents: ", e); }
    }

    async function setpollstatus(status: boolean) {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/active`);
        console.log(pollsref);

        try { await set(pollsref, status); setPollstatus(status); }
        catch (e) { console.error("Error getting documents: ", e); }
    }
      
    async function endPoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls/${live![1]}/done`);
        console.log(pollsref);

        try { await set(pollsref, true); setPollFinalStatus(true); setpollstatus(false);
            let fxname = "transferPollResults"

            const transferPollResultsFx = httpsCallable(fxns, fxname);
            const result = await transferPollResultsFx({ pollId: pollId, classId: classId });
            console.log(result.data);
            
        
        }
        catch (e) { console.error("Error getting documents: ", e); }
    }

    //wait until router is loaded
    useEffect(() => {
        if (live) {
            console.log(live);
            setPollId(live[1] as string);
            setClassId(live[0] as string);
            getpoll();
        }
    }, [live]);

    useEffect(() => {
        // Need live to be an array and have a length greater than 1
        if (Array.isArray(live) && live.length > 1) {
            const pollsRef = ref(rdb, `classes/${live[0]}/polls/${live[1]}`);
            const unsubscribe = onValue(pollsRef, (snapshot) => {
                const polls = snapshot.val();
                console.log(polls, "polls");
                setLivepoll(polls);
            });

            return () => unsubscribe();
        }
    }, [live]);

    return (
        <div className={s.livepoll}>
            {
                live ?
                    <div className={s.poll}>
                        <div className={s.question}>{livepoll?.question}</div>
                        <div className={s.options}>
                            {
                                livepoll?.options.map((option, index) => {
                                    return (
                                        <div key={index} className={s.option}>
                                            <div className={s.letter}>{option.letter}</div>
                                            <div className={s.content}>{option.option}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        {
                            pollstatus ?
                                <button onClick={() => setpollstatus(false)} className={s.stop}>Stop</button>
                                :
                                <button onClick={() => setpollstatus(true)} className={s.start}>Start Poll</button>
                        }
                        {
                            pollFinalStatus ?
                            <>poll ended</>
                            :
                            <button onClick={() => endPoll()} className={s.stop}>End Poll</button>
                        }

                        <div className={s.buttonWrapper}>
                            

                            {
                                pollstatus ?
                                    <button onClick={() => setpollstatus(false)} className={s.stop}>Stop</button>
                                    :
                                    <button onClick={() => setpollstatus(true)} className={s.start}>Start Poll</button>
                            }
                            
                            <button onClick={handleShowAnswers} className={s.answer}>
                                {showAnswers ? "Hide Answers" : "Show Answers"}
                            </button>
                        </div>
                    </div>
                    :
                    ""
            }  
            <div className={s.answerWrapper}>
                <div>
                    {showAnswers && correctAnswers.length > 0 && (
                        <div className={s.answers}>
                            <h2>Correct Answer</h2>
                            <p>{correctAnswers}</p>
                        </div>
                    )}
                </div>
                {showAnswers && livepoll && data.length > 0 && (
                    <div className={s.content}>
                        <BarChart
                            dataset={data}
                            yAxis={[{ scaleType: 'band', dataKey: 'option' }]}
                            series={[
                                {
                                    dataKey: "responses",
                                },
                            ]}
                            layout="horizontal"
                            width={800}
                            height={300}
                            bottomAxis={null}
                            sx={{
                                "& .MuiBarElement-root:nth-child(1)": {
                                    fill: "#FBB91B", // Style the first bar
                                },
                                "& .MuiBarElement-root:nth-child(2)": {
                                    fill: "#FE6768", // Style the second bar
                                },
                                "& .MuiBarElement-root:nth-child(3)": {
                                    fill: "#9596FF", //
                                },
                                "& .MuiBarElement-root:nth-child(4)": {
                                    fill: "blue", // 
                                },
                                "& .MuiBarElement-root:nth-child(5)": {
                                    fill: "purple",
                                },
                                //change left yAxis label styles
                                "& .MuiChartsAxis-tickLabel":{
                                    strokeWidth:"0.4",
                                    fontSize: "20px !important",
                                    fontWeight: "bold",
                                    fontFamily: "Open Sans, sans-serif",
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Live Poll response section */}
            {/* If the poll is live (Start poll) then we only show how many have responded and after we stop the poll we show the disparity of answers like bar/pie graph */}

            <div className={s.live}>
                {livepoll && livepoll.active && (
                    <div className={s.response}> 
                        {
                            livepoll.responses ?
                            // Creates a new Set to hold unique student IDs
                            new Set(
                                // Get an array of all student objects
                                Object.values(livepoll.responses)
                                // Flatten the array of student objects into an array of student IDs
                                .flatMap(response => Object.keys(response))
                            ).size
                            :
                            0
                        }
                        {"  "}
                        Answered
                    </div>

                )}
            </div>
        </div>
    )
}
