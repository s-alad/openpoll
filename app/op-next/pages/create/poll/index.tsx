import s from './create.poll.module.scss';
import { auth, db, fxns, rdb } from "../../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
import { push, ref, set } from 'firebase/database';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';
import CreateOrderingPoll from '@/forms/create-ordering-poll/create-ordering-poll';
import { createattendanceformdata } from '@/validation/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceSchema } from '@/validation/schema';

export default function CreatePoll() {

	const router = useRouter();
	const classid = router.query.classid

	type PollTypes = "Multiple Choice" | "Short Answer" | "Ordering" | "Attendance";
	const [polltype, setpolltype] = useState<PollTypes>("Multiple Choice");

	// attendance ============================================

	async function createAttendance(data: createattendanceformdata) {
		console.log('form data submitted:', data);

		const user = auth.currentUser;
		const uid = user!.uid;

		const polldata = {
			type: "attendance",
			classid: classid,
			date: data.date,
			question: "Attendance for " + data.date.toLocaleDateString(),
			attended: data.attended,
			created: new Date(),
			creator: uid,
			active: false,
			done: false
		}
		console.log(polldata);

		const classref = doc(db, "classes", classid as string);
		const pollref = collection(classref, "polls");

		try {
			const docRef = await addDoc(pollref, polldata);
			const pollid = docRef.id;
			const rdbref = ref(rdb, `classes/${classid}/polls/${pollid}`);
			await set(rdbref, polldata)

			router.back();
		} catch (e) {
			console.error("Error adding document: ", e);
		}

	}

	const { register: registerattendance, handleSubmit: handleSubmitattendance, control: control3, formState: { errors: errors3 } } =
		useForm<createattendanceformdata>({
			resolver: zodResolver(createAttendanceSchema),
			defaultValues: {
				date: new Date(),
				attended: []
			}
		});


	return (
		<>
			<main className={s.createpoll}>
				<div className={s.create}>

					<div className={s.selector}>
						{
							["Multiple Choice", "Short Answer", "Ordering", "Attendance"].map(type => (
								<div
									key={type}
									onClick={() => setpolltype(type as PollTypes)}
									className={polltype === type ? s.selected : ""}
								>
									{type}
								</div>
							))
						}
					</div>
					{
						polltype === "Multiple Choice" && <CreateMultipleChoicePoll />
					}
					{
						polltype === "Short Answer" && <CreateShortAnswerPoll />
					}
					{
						polltype === "Ordering" && <CreateOrderingPoll />
					}
					{
						polltype === "Attendance" && <div>
							<h2>Create Attendance Poll for Today</h2>
							<button onClick={() => createAttendance({ date: new Date(), attended: [] })} className={s.submitButton}>
								Create Attendance Poll
							</button>
						</div>
					}
				</div>
			</main>
		</>
	);
}
