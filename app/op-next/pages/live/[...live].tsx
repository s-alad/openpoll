import { rdb } from "@/firebase/firebaseconfig";
import { equalTo, get, onValue, orderByChild, query, ref, set } from "firebase/database";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import s from './live.module.scss';
import { BarChart } from '@mui/x-charts'

interface LivePoll {
    active: boolean;
    options: {
        option: string;
        letter: string;
    }[];
    question: string;
    responses?: {
        [letter: string]: {
            [studentid: string]: string;
        }
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
    const [data, setData] = useState<DatasetElementType[]>([]);

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

    console.log(data, "dataSet")
      
    const chartSetting = {
        margin: {
            top: 50,
            right: 30,
            bottom: 20,
            left: 30,
          },
          width: 500,
          height: 400,
    }; // Chart settings

    async function getpoll() {
        const pollsref = ref(rdb, `classes/${live![0]}/polls`);
        console.log(pollsref);

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


    //wait until router is loaded
    useEffect(() => {
        if (live) {
            console.log(live);
            getpoll();
        }
    }, [live]);


    // useEffect(() => {
    //     const pollsRef = ref(rdb, `classes/${live![0]}/polls/${live![1]}`);
    //     const unsubscribe = onValue(pollsRef, (snapshot) => {
    //         const polls = snapshot.val();
    //         console.log(polls);
    //         setLivepoll(polls);
    //     });

    //     return () => unsubscribe();
    // }, [live]);

    useEffect(() => {
        // Need live to be an array and have a length greater than 1
        if (Array.isArray(live) && live.length > 1) {
            const pollsRef = ref(rdb, `classes/${live[0]}/polls/${live[1]}`);
            const unsubscribe = onValue(pollsRef, (snapshot) => {
                const polls = snapshot.val();
                console.log(polls);
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
                    </div>
                    :
                    ""
            }
            {/* Live Poll response section */}
            {/* If the poll is live (Start poll) then we only show how many have responded and after we stop the poll we show the disparity of answers like bar/pie graph */}
            <div className={s.live}>
            {
                livepoll && livepoll.active ?
                    <div className={s.response}> 
                        {
                            livepoll.responses ?
                            // Creates a new Set to hold unique student IDs
                            new Set(
                                // Get an array of all student objects
                                Object.values(livepoll.responses)
                                // Flatten the array of student objects into an array of student IDs
                                .flatMap(response => Object.keys(response.students))
                            ).size
                            :
                            0
                        }
                        {"  "}
                        Answered
                    </div>
                    :
                    // Shows the bar graph of the responses if the poll is stopped
                    (data.length > 0 && (
                        <BarChart
                            dataset={data}
                            yAxis={[{ scaleType: 'band', dataKey: 'option' }]} 
                            series={[{
                                dataKey: 'responses',
                                label: 'Number of Responses',
                            }]}
                            layout="horizontal"
                            {...chartSetting}
                        />
                    ))
            }
            </div>
        </div>
    )
}