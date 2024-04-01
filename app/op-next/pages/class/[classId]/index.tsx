import { useAuth } from "@/context/authcontext";
import { rdb } from "@/firebase/firebaseconfig";
import { Checkbox, FormControlLabel } from "@mui/material";
import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  update,
} from "firebase/database";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import s from "./class.module.scss";

interface LivePoll {
    id: string;
    active: boolean;
    type: "mc" | "short" | "attendance";
    options: {
        letter: string;
        option: string;
    }[],
    responses?: {
        [letter: string]: {
            [studentid: string]: [email: string];
        }
    }
    question: string;
    id: string;
    active: boolean;
    type: "mc" | "short" | "attendance";
    options: {
        letter: string;
        option: string;
    }[],
    responses?: {
        [letter: string]: {
            [studentid: string]: [email: string];
        }
    }
    question: string;
}

export default function Class() {

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classId;
    console.log(classid, 'classid')

    // get the class id from the url
    const router = useRouter();
    const classid = router.query.classId;
    console.log(classid, 'classid')

    const { user } = useAuth();
    const { user } = useAuth();

    const [activePolls, setActivePolls] = useState<LivePoll[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [activePolls, setActivePolls] = useState<LivePoll[]>([]);
    const [submitted, setSubmitted] = useState<boolean>(false);

    useEffect(() => {
        const pollsRef = query(ref(rdb, `classes/${classid}/polls`), orderByChild('active'), equalTo(true));
        const unsubscribe = onValue(pollsRef, (snapshot) => {
            const polls = snapshot.val();
            console.log(polls);
            const activePolls = [];
            for (const id in polls) {
                if (polls[id].active) {
                    activePolls.push({ ...polls[id], id });
                }
            }
            console.log(activePolls);
            setActivePolls(activePolls);
        });

        return () => unsubscribe();
    }, [classid]);

    async function submitPoll(data: any, pollId: string) {
        console.log(data);

        // get the data letter that is true
        const selectedOptions = Object.keys(data).filter((key) => data[key]);
        const nonSelectedOptions = Object.keys(data).filter((key) => !data[key]);
        console.log(selectedOptions);

        // add student to selected options
        for (const letter of selectedOptions) {
            const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses/${letter}`);
            await update(answerRef, { [user!.uid]: user!.email });
        }

        // remove student from non selected options
        for (const letter of nonSelectedOptions) {
            const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses/${letter}/${user!.uid}`);
            await remove(answerRef);
        }
      }
      console.log(activePolls);
      setActivePolls(activePolls);
    });

        return () => unsubscribe();
    }, [classid]);

  async function submitPoll(data: any, pollId: string) {
    console.log(data);

    // get the data letter that is true
    const selectedOptions = Object.keys(data).filter((key) => data[key]);
    const nonSelectedOptions = Object.keys(data).filter((key) => !data[key]);
    console.log(selectedOptions);

    // add student to selected options
    for (const letter of selectedOptions) {
      const answerRef = ref(
        rdb,
        `classes/${classid}/polls/${pollId}/responses/${letter}`,
      );
      await update(answerRef, { [user!.uid]: user!.email });
    }

    // remove student from non selected options
    for (const letter of nonSelectedOptions) {
      const answerRef = ref(
        rdb,
        `classes/${classid}/polls/${pollId}/responses/${letter}/${user!.uid}`,
      );
      await remove(answerRef);
    }

    async function submitAttendancePoll(data: any, pollId: string) {

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, { [user!.uid]: user!.email });
    }

    const { handleSubmit, control, register,  formState: { errors } } = useForm({});

    return (
        <div className={s.class}>
            <Link
                      href={{
                        pathname: `/class/${classid}/grades`,
                        query: { id: classid },
                      }}
                      className={s.gradesButton}
                    >
                Grades
            </Link>
            {
                classid && activePolls.length > 0 ?
                    <div className={s.openpolls}>
                        {
                            activePolls.map((poll) => {

                                if (poll.type === "mc") return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitPoll(data, poll.id))
                                    }>
                                        
                                        <h1>{poll.question}</h1>

                                        <div className={s.options}>
                                            {
                                                poll.options.map((option: { option: string, letter: string }) => {
                                                    return (
                                                        <div key={option.letter} className={s.option}>
                                                            <Controller
                                                                control={control}
                                                                name={option.letter}
                                                                defaultValue={
                                                                    poll.responses && poll.responses[option.letter] && user!.uid in poll.responses[option.letter]
                                                                }
                                                                render={({ field }) => (
                                                                    <FormControlLabel
                                                                        control={<Checkbox {...field}
                                                                            defaultChecked={
                                                                                poll.responses && poll.responses[option.letter] && user!.uid in poll.responses[option.letter]
                                                                            }
                                                                        />}
                                                                        label={option.letter}
                                                                    />
                                                                )}
                                                            />


                                                            <div className={s.content}>{option.option}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                        <button type="submit">Submit</button>
                                    </form>
                                )

                                if (poll.type === "short") return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitShortPoll(data, poll.id))
                                    }>
                                        <h1>{poll.question}</h1>

                                        <input type="text" {...control.register("answer")} />

                                        <button type="submit">Submit</button>
                                    </form>
                                )

                                if (poll.type === "attendance") return (
                                    <form key={poll.id} className={s.poll} onSubmit={handleSubmit((data) => submitAttendancePoll(data, poll.id))}>
                                      <h1>{poll.question}</h1>
                                      <div className={s.inputGroup}>
                                        <input
                                          type="text"
                                          {...register("attendanceCode", {
                                            required: "Code is required",
                                            validate: (value) => value === poll.id.slice(-4) || "Incorrect code"
                                          })}
                                          placeholder="Enter Attendance Code"
                                          className={s.attendanceInput}
                                        />
                                        {errors.attendanceCode && <p className={s.errorMessage}>{"wrong code"}</p>}
                                      </div>
                                      <button type="submit" className={s.attendanceButton}>
                                        I'm Here
                                      </button>
                                    </form>
                                  );
                            })
                        }
                    </div> : <div className={s.openpolls}>no active polls</div>
            }
                                                            <div className={s.content}>{option.option}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                        <button type="submit">Submit</button>
                                    </form>
                                )

                                if (poll.type === "short") return (
                                    <form key={poll.id} className={s.poll} onSubmit={
                                        handleSubmit((data) => submitShortPoll(data, poll.id))
                                    }>
                                        <h1>{poll.question}</h1>

                                        <input type="text" {...control.register("answer")} />

                                        <button type="submit">Submit</button>
                                    </form>
                                )

                                if (poll.type === "attendance") return (
                                    <form key={poll.id} className={s.poll} onSubmit={handleSubmit((data) => submitAttendancePoll(data, poll.id))}>
                                      <h1>{poll.question}</h1>
                                      <div className={s.inputGroup}>
                                        <input
                                          type="text"
                                          {...register("attendanceCode", {
                                            required: "Code is required",
                                            validate: (value) => value === poll.id.slice(-4) || "Incorrect code"
                                          })}
                                          placeholder="Enter Attendance Code"
                                          className={s.attendanceInput}
                                        />
                                        {errors.attendanceCode && <p className={s.errorMessage}>{"wrong code"}</p>}
                                      </div>
                                      <button type="submit" className={s.attendanceButton}>
                                        I'm Here
                                      </button>
                                    </form>
                                  );
                            })
                        }
                    </div> : <div className={s.openpolls}>no active polls</div>
            }
        </div>
      ) : (
        <div className={s.openpolls}>no active polls</div>
      )}
    </div>
  );
}