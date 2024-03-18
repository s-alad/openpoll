import s from './create.poll.module.scss';
import { auth, db, fxns, rdb } from "../../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
import { createpollformdata, createshortanswerformdata } from "@/models/form";
import { createPollSchema, createShortAnswerSchema } from "@/models/schema";
import { useForm, UseFormProps, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import QuestionInput from '@/components/question-input/question-input';
import AnswerInput from '@/components/answer-input/answer-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faMinusCircle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';


import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { push, ref, set } from 'firebase/database';
import ShortAnswerInput from '@/components/short-answer-input/short-answer-input';

export default function CreatePoll() {

	const router = useRouter();
	const classid = router.query.classid

	type polltypes = "mc" | "short";
	const [polltype, setpolltype] = useState<polltypes>("mc");

	// mc ========================================

	async function createpoll(data: createpollformdata) {
		console.log('form data submitted:', data);

		const user = auth.currentUser;
		const uid = user!.uid;

		const polldata = {
			classid: classid,
			question: data.question,
			options: data.options,
			answers: data.answers,
			created: new Date(),
			active: false,
			done: false
		}

		console.log(polldata);

		const classref = doc(db, "classes", classid as string);
		const pollref = collection(classref, "polls");

		try {
			const docRef = await addDoc(pollref, polldata);


			// now add the poll to the realtime database with the id of the firestore poll
			/* const rdbref = ref(rdb, `classes/${classid}/polls`);
			const newPollRef = push(rdbref);
			await set(newPollRef, {
				question: polldata.question,
				options: polldata.options,
				active: false,
			}) */

			const pollid = docRef.id;
			const rdbref = ref(rdb, `classes/${classid}/polls/${pollid}`);
			await set(rdbref, {
				question: polldata.question,
				options: polldata.options,
				active: false,
				done: false,
				responses: []
			})

			router.back();
		} catch (e) {
			console.error("Error adding document: ", e);
		}

	}

	const colorselection: { [key: string]: string } = { "A": s.a, "B": s.b, "C": s.c, "D": s.d }
	const initalpolls = [{ letter: "A", option: "" }, { letter: "B", option: "" }];

	const { register, handleSubmit, control, setError, formState: { errors } } = useForm<createpollformdata>({
		resolver: zodResolver(createPollSchema),
		defaultValues: {
			options: initalpolls,
			answers: []
		}
	});

	const { fields, append, remove, update, } = useFieldArray({
		control,
		name: "options"
	});

	// short ========================================

	async function createshortanswer(data: createshortanswerformdata) {
		console.log('form data submitted:', data);

		const user = auth.currentUser;
		const uid = user!.uid;

		const polldata = {
			type: "short",
			classid: classid,
			question: data.question,
			answers: data.answers,
			created: new Date(),
			active: false,
		}

		console.log(polldata);

		const classref = doc(db, "classes", classid as string);
		const pollref = collection(classref, "polls");

		try {
			const docRef = await addDoc(pollref, polldata);
			
			const pollid = docRef.id;
			const rdbref = ref(rdb, `classes/${classid}/polls/${pollid}`);
			await set(rdbref, {
				type: "short",
				question: polldata.question,
				active: false,
				responses: []
			})

			router.back();
		} catch (e) {
			console.error("Error adding document: ", e);
		}


	}

	const { register: registershort, handleSubmit: handleSubmitshort, control: control2, formState: { errors: errors2 } } = 
	useForm<createshortanswerformdata>({
		resolver: zodResolver(createShortAnswerSchema),
		defaultValues: {
			question: "",
			answers: ""
		}
	});




	return (
		<>
			<main className={s.createpoll}>
				<div className={s.create}>
					<div className={s.selector}>
						{
							["mc", "short"].map((type) => {
								return (
									<div
										className={`${s.type} ${polltype === type ? s.active : ""}`}
										key={type}
										onClick={() => setpolltype(type as polltypes)}
									>
										{type}
									</div>
								)
							})
						}
					</div>

					{
						polltype === "mc" ?

							<form onSubmit={handleSubmit(createpoll)}>
								<QuestionInput
									type="text"
									placeholder="Enter your question"
									register={register}
									name="question"
									error={errors.question}
									description="Question"
								/>
								<div className={s.options}>
									{
										fields.map((field, index) => {
											return (
												<div className={s.mc} key={field.id}>
													<div className={s.choice}>
														<div className={`${s.letter} ${colorselection[field.letter]}`}>{field.letter}</div>
													</div>
													<AnswerInput
														type="text"
														placeholder="Enter your answer"
														register={register}
														name={`options`}
														error={errors.options?.[index]?.option}
														index={index}
													/>
													{
														index === fields.length - 1 ?
															<div className={s.delete} onClick={() => { remove(index); }}>
																<FontAwesomeIcon icon={faTrash} />
															</div>
															: null
													}
												</div>
											)
										}
										)}
									<div className={s.add}>
										<FontAwesomeIcon icon={faPlus} onClick={
											() => append({ letter: String.fromCharCode(65 + fields.length), option: "" })
										} />
									</div>
								</div>

								<Controller
									name='answers'
									control={control}
									render={({ field }) => (
										<FormControl sx={{ width: 300 }}>
											<label>Answers:</label>
											<Select
												label={false}
												multiple
												value={field.value}
												sx={{ height: 40, borderRadius: 0 }}
												onChange={field.onChange}
												inputProps={
													{
														MenuProps: {
															MenuListProps: { sx: { borderRadius: 0, } },
															PaperProps: { sx: { borderRadius: 0, }, }
														}
													}
												}
												input={
													<OutlinedInput
														style={{
															borderRadius: "0px",
															backgroundColor: "white",
															display: "flex",
															justifyContent: "center",
															alignItems: "center",
															padding: 0
														}}
													/>
												}
												renderValue={(selected) => (
													<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', borderRadius: '0px' }}>
														{selected.map((value) => (
															<Chip key={value} label={value}
																style={{ width: "50px", borderRadius: "0px", height: "20px" }}
															/>
														))}
													</Box>
												)}

											>
												{fields.map((field, index) => (
													<MenuItem key={field.letter} value={field.letter} sx={{ borderRadius: "0px" }}>
														{field.letter}
													</MenuItem>
												))}

											</Select>
										</FormControl>
									)}
								/>



								<button type="submit">Create Poll</button>
							</form>
							: 
							<form onSubmit={handleSubmitshort(createshortanswer)}>
								<ShortAnswerInput
									type="text"
									placeholder="Enter your short answer prompt"
									register={registershort}
									name="question"
									error={errors.question}
									description="Short Answer Prompt"
								/>
								<ShortAnswerInput
									type="text"
									placeholder="Enter the answer"
									register={registershort}
									name="answers"
									error={errors.answers as any}
									description="Answer"
								/>
								<button type="submit">Create Short Answer</button>
							</form>
					}
				</div>
			</main>
		</>
	);
}
