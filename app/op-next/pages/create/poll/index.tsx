import s from './create.poll.module.scss';
import { auth, db, fxns, rdb } from "../../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
<<<<<<< HEAD
import { createpollformdata, createshortanswerformdata, createattendanceformdata } from "@/validation/form";
import { createPollSchema, createShortAnswerSchema, createAttendanceSchema } from "@/validation/schema";
=======
>>>>>>> 5251451 (PURGE)
import { push, ref, set } from 'firebase/database';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';

export default function CreatePoll() {

	const router = useRouter();
	const classid = router.query.classid

	type PollTypes = "Multiple Choice" | "Short Answer" | "Ordering";
	const [polltype, setpolltype] = useState<PollTypes>("Multiple Choice");

	// ordering ========================================

	async function createorderpoll(data: any) {
		console.log('form data submitted:', data);

		const user = auth.currentUser;
		const uid = user!.uid;

		const polldata = {
			type: "ordering",
			classid: classid,
			question: data.question,
			options: data.options,
			answers: data.answers,
			created: new Date(),
			creator: uid,
			responses: [],
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

	const { register: register2, handleSubmit: handleSubmit2, control: control3, formState: { errors: errors3 } } = useForm<createpollformdata>({
		resolver: zodResolver(createPollSchema),
		defaultValues: {
			options: initalpolls,
			answers: []
		}
	});


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
					
				</div>
			</main>
		</>
	);
}
