import React from "react";
import s from "./create-attendance-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateAttendancePollFormData } from "@/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/ui/button/button";
import { auth, db, fxns, rdb } from "@/firebase/firebaseconfig";
import { addDoc, collection, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";
import { createAttendanceSchema } from "@/validation/schema";

export default function CreateAttendancePoll() {

    const router = useRouter();
    const classid = router.query.classid as string;

    async function createAttendance(data: CreateAttendancePollFormData) {
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
        useForm<CreateAttendancePollFormData>({
            resolver: zodResolver(createAttendanceSchema),
            defaultValues: {
                date: new Date(),
                attended: []
            }
        });

    return (
        <form className={s.form} /* onSubmit={handleSubmit(onSubmit)} */>

            <div className={`${s.create} ${s.attendance}`}>
                <h2>Create Attendance Poll for Today</h2>
                <button onClick={() => createAttendance({ date: new Date(), attended: [] })} className={s.submitButton}>
								Create Attendance Poll
							</button>
            </div>
            <Spacer />
            {/* <Button type="submit" text="Submit" /> */}

        </form>
    )
}