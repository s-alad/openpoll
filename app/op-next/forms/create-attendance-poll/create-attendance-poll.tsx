import React from "react";
import s from "./create-attendance-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateAttendancePollFormData } from "@/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/ui/button/button";
import { auth, db, fxns, rdb } from "@openpoll/packages/config/firebaseconfig";
import { addDoc, collection, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";
import { createAttendanceSchema } from "@/validation/schema";
import AttendancePoll from "@openpoll/packages/models/poll/attendance";

export default function CreateAttendancePoll() {

	const router = useRouter();
	const classid = router.query.classid as string;

	// attendance ============================================

	async function onSubmit(data: CreateAttendancePollFormData) {
		console.log('form data submitted:', data);

		const user = auth.currentUser;
		const uid = user!.uid;

		const polldata: AttendancePoll = {
			type: "attendance",
			classid: classid,
			date: data.date,
			question: "Attendance for " + data.date.toLocaleDateString(),
			createdat: new Date(),
			creator: uid,
			active: false,
			done: false,
			responses: {}
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

	const { register, handleSubmit, control: control3, formState: { errors: errors3 } } =
		useForm<CreateAttendancePollFormData>({
			resolver: zodResolver(createAttendanceSchema),
			defaultValues: {
				date: new Date(),
				question: "Attendance for " + new Date().toLocaleDateString(),
			}
		});

	return (
		<form className={s.form} onSubmit={handleSubmit(onSubmit)}>


			<div className={s.createattend}>Create Attendance Poll for Today</div>
			<div className={s.date}>{new Date().toLocaleDateString()}</div>
			<Spacer />
			<Button type="submit" text="Create Attendance Poll"
				onClick={
					() => console.log("Create Attendance Poll")
				} />
		</form>
	)
}