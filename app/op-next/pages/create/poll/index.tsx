import s from './create.poll.module.scss';
import { auth, db, fxns } from "../../../firebase/firebaseconfig";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
import { createpollformdata } from "@/models/form";
import { createPollSchema } from "@/models/schema";
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

export default function CreatePoll() {

	const router = useRouter();

	const classid = router.query.classid
	console.log(classid);

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
		}

		console.log(polldata);

		const classref = doc(db, "classes", classid as string);
		const pollref = collection(classref, "polls");

		try {
			await addDoc(pollref, polldata);
			router.push(`/class/${classid}`);
		} catch (e) {
			console.error("Error adding document: ", e);
		}


		try {

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



	return (
		<>
			<main className={s.createpoll}>
				<div className={s.create}>
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
													MenuListProps: {sx: {borderRadius: 0,}},
													PaperProps: {sx: {borderRadius: 0,},}
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
				</div>
			</main>
		</>
	);
}
