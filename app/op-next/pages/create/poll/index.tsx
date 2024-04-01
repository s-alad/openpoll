import s from './create.poll.module.scss';
import { auth, db, fxns, rdb } from "../../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
import { push, ref, set } from 'firebase/database';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';
import CreateOrderingPoll from '@/forms/create-ordering-poll/create-ordering-poll';

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

	return (
		<>
			<main className={s.createpoll}>
				<div className={s.create}>

					<div className={s.selector}>
						{
							["Multiple Choice", "Short Answer", "Ordering"].map(type => (
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
				</div>
			</main>
		</>
	);
}
