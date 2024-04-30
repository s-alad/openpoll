import { useAuth } from "@/context/authcontext";
import Poll, { PollAndId, getCorrectPollType } from "@openpoll/packages/models/poll";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp, collection, doc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { auth, db } from '@openpoll/packages/config/firebaseconfig';
import s from "./classGrades.module.scss";
import Link from "next/link";
import Image from "next/image";
import { AppBar, Tabs, Tab, Box, Typography } from "@mui/material";
import TopSection from "@/components/grades/topSection/topSection";
import StudentStats from "@/components/grades/studentStats/studentStats";
import MCPoll, { MCResponses } from "@openpoll/packages/models/poll/mc";
import ShortPoll, { ShortResponses } from "@openpoll/packages/models/poll/short";
import OrderPoll from "@openpoll/packages/models/poll/ordering";
import AttendancePoll from "@openpoll/packages/models/poll/attendance";
import MatchPoll from "@openpoll/packages/models/poll/matching";
import { set } from "firebase/database";

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

export default function ClassGrades() {
	const [loading, setLoading] = useState(false);

	// get the class id from the url
	const router = useRouter();
	const classid = router.query.classid;
	const { user } = useAuth();

	const [openPolls, setOpenPolls] = useState<PollAndId[]>([]);
	const [attendancePolls, setAttendancePolls] = useState<PollAndId[]>([]);
	const [numCorrect, setNumCorrect] = useState(0); // Number of correct answers used as an integer to display how many questions the student got correct
	const [totalQuestions, setTotalQuestions] = useState(0); // Total number of questions in the poll
	const [questionsAnswered, setQuestionsAnswered] = useState(0); // Number of questions the student answered
	const [totalGrade, setTotalGrade] = useState(0); // Total grade of the student
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
		
		const allPolls = query(collection(classRef, "polls"), where("done", "==", true));
		const allPollsSnapshot = await getDocs(allPolls);

		const openPollsData: PollAndId[] = [];
		const attendancePollsData: PollAndId[] = [];
        
		allPollsSnapshot.forEach((doc) => {
			const pid = doc.id;
			const data = doc.data();
			const poll = getCorrectPollType(data);
			// push pid to poll
			if (!poll) return;

			if (poll.type === "attendance") {
				attendancePollsData.push({id: pid, poll: poll as AttendancePoll});
			} else if (poll.type === "mc" || poll.type === "short" || poll.type === "order" || poll.type === "match") {
				openPollsData.push({id: pid, poll: poll as MCPoll | ShortPoll | OrderPoll | MatchPoll});
			}
		});

		setOpenPolls(openPollsData);
        setTotalQuestions(openPollsData.length);
		setAttendancePolls(attendancePollsData);
		setLoading(false);
	}


	async function extractPolls() {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			console.error("No current user found");
			return;
		}
		const uid = currentUser.uid;

		let correctCount = 0;
		let questionsAnswered = 0;
		let attendanceCount = 0;
		let totalGrade = 0;

		openPolls.forEach((poll) => {
			if (poll.poll.type === "mc") {
				const mcPoll = poll.poll as MCPoll;
				const userResponse = mcPoll.responses[uid];
				console.log(userResponse);
				if (userResponse) {
					if (userResponse.correct) {
						correctCount++;
					}
				} else {
					console.log("No response found");
					return;
				}
			} else if (poll.poll.type === "short") {
				const shortPoll = poll.poll as ShortPoll;
				if (!shortPoll.responses) return;
				console.log(shortPoll.responses);
				const userResponse = shortPoll.responses[uid];
				if (userResponse) {
					if (userResponse.response.toLowerCase() === shortPoll.answerkey?.toLowerCase()) {
						correctCount++;
					}
				} else {
					console.log("No response found");
					return;
				}
			} else if (poll.poll.type === "order") {
				const orderPoll = poll.poll as OrderPoll;
				const userResponse = orderPoll.responses[uid];
				if (userResponse) {
					if (userResponse.correct) {
						correctCount++;
					}
				} else {
					console.log("No response found");
					return;
				}
			}
			questionsAnswered++;
			// Do match poll when there is a correct
			// else if (poll.poll.type == "match") {
			// 	const matchPoll = poll.poll as MatchPoll;
			// 	const userResponse = matchPoll.responses[uid];
			// 	if (userResponse) {
			// 		if (userResponse.correct) {
			// 			correctCount++;
			// 		}
			// 	} else {
			// 		console.log("No response found");
			// 		return;
			// 	}
			// }

			
		});
		
		attendancePolls.forEach((poll) => {
			const attendancePoll = poll.poll as AttendancePoll;
			const userResponse = attendancePoll.responses[uid];
			if (userResponse) {
				if (userResponse.attended) {
					attendanceCount++;
				}
			} else {
				console.log("No response found");
				return;
			}
		});

		totalGrade = (correctCount / totalQuestions) * 100;
		setQuestionsAnswered(questionsAnswered);
		console.log("Questions answered", questionsAnswered);
		setNumCorrect(correctCount);
		setTotalGrade(totalGrade);
		setAttendedCount(attendanceCount);
		console.log("Total grade", totalGrade);
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
		if (openPolls.length > 0) {
			console.log("Extracted polls");
			extractPolls();
		}
	}, [openPolls]); // Only run the effect when openpolls changes


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
							studentAttendanceLength={attendancePolls.length}
							numCorrect={numCorrect}
							totalQuestions={totalQuestions}
						/>
						<StudentStats
							studentAttendance={attendedCount}
							studentAttendanceLength={attendancePolls.length}
							questionsAnswered={questionsAnswered}
							totalQuestions={totalQuestions}
							numCorrect={numCorrect}
						/>
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
										<h2>Correctness</h2>
										<h2>Total</h2>
									</div>
									<div className={s.questionsList}>
										{openPolls.map((pollAndId, index) => {
											const uid = auth.currentUser?.uid;
											if (!uid) return;
											let correct = false;
											let answerkey = "";

											if (pollAndId.poll.type === "mc") {
												const mcPoll = pollAndId.poll as MCPoll;
												correct = mcPoll.responses[uid].correct;
												answerkey = mcPoll.answerkey.join(", ");
											} else if (pollAndId.poll.type === "short") {
												const shortPoll = pollAndId.poll as ShortPoll;
												if (!shortPoll.responses) {
													correct = true;
												} else {
													console.log(shortPoll.responses);
													console.log(uid)
													if (!shortPoll.responses[uid]) {
														correct = false;
													} else {
														correct = shortPoll.responses[uid].response.toLowerCase() === shortPoll.answerkey?.toLowerCase();
													}
												}
												answerkey = shortPoll.answerkey ?? '';
											} else if (pollAndId.poll.type === "order") {
												const orderPoll = pollAndId.poll as OrderPoll;
												correct = orderPoll.responses[uid].correct;
											}

											return (
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
																href={`/class/${classid}/grades/${pollAndId.id}`}
																passHref
																className={s.questionLink}
															>
																<h2 className={s.questionText}>
																	{pollAndId.poll.question}
																</h2>
															</Link>
															<Typography variant="body2" className={s.correctAnswer}>
																Correct answer is {answerkey}
															</Typography>
														</div>
													</div>
													<div className={s.stat}>{correct ?
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
													<div className={s.stat}>{correct ? 
														"1/1" :
														"0/1"
													}
													</div>
												</div>
											)
										})}
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
										{attendancePolls.map((pollAndId, index) => {
											const uid = auth.currentUser?.uid;
											if (!uid) return;
											let attended = false;

											const attendancePoll = pollAndId.poll as AttendancePoll;
											attended = attendancePoll.responses[uid].attended;

											return (
												<div key={index} className={s.question}>
													<div className={s.responseColumn}>
														<div>
															<h2>
																{attendancePoll.date.toDate().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
															</h2>
														</div>
													</div>
													<div className={s.stat}>
														{attended ?
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
											)
										})}
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