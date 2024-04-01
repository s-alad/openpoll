import React from "react";
import s from "./create-short-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateMultipleChoicePollFormData, CreateShortAnswerFormData } from "@/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMultipleChoicePollData, createShortAnswerSchema } from "@/validation/schema";
import Button from "@/ui/button/button";
import { useAuth } from "@/context/authcontext";
import { addDoc, collection, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rdb } from "@/firebase/firebaseconfig";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";

export default function CreateShortAnswerPoll() {
    
    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<CreateShortAnswerFormData>(
        {
            resolver: zodResolver(createShortAnswerSchema),
        }
    );

    const onSubmit = async (data: CreateShortAnswerFormData) => {
        console.log("SUCCESS", data);

        console.log('form data submitted:', data);

		const uid = user!.uid;

		const polldata = {
			type: "short",
			classid: classid,
			question: data.question,
			answers: data.answers,
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

    return (
        <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
            
            <Input<CreateShortAnswerFormData>
                type="text"
                label="Question"
                name="question"
                placeholder="Your Question"
                register={register}
                error={errors.question}
            />

            <Input<CreateShortAnswerFormData>
                type="text"
                label="Answer"
                name="answers"
                placeholder="Your Answer"
                register={register}
                error={errors.answers as any}
            />
            <Spacer />
            <Button type="submit" text="Submit" />

        </form>
    )
}