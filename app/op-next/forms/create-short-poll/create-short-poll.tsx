import React from "react";
import s from "./create-short-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateMultipleChoicePollFormData, CreateShortAnswerPollFormData } from "@openpoll/packages/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMultipleChoicePollData, createShortAnswerPollSchema } from "@openpoll/packages/validation/schema";
import Button from "@/ui/button/button";
import { useAuth } from "@/context/authcontext";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rdb } from "@openpoll/packages/config/firebaseconfig";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";
import ShortPoll from "@openpoll/packages/models/poll/short";


type CreateShortPollProps = {
    pollData?: ShortPoll
    pollid?: string
}

export default function CreateShortAnswerPoll({ pollData, pollid }: CreateShortPollProps) {


    function returnString(input: any) {
        // Check if input is an array and if the first element is a string
        if (Array.isArray(input) && typeof input[0] === 'string') {
            return input[0]; // Return the first string of the array
        } 
        // Check if the input is a string
        else if (typeof input === 'string') {
            return input; // Return the input string
        }
        // Handle cases where input is neither a string array nor a string
        else {
            return ""; // Return null or throw an error as per your needs
        }
    }
    
    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<CreateShortAnswerPollFormData>(
        {
            resolver: zodResolver(createShortAnswerPollSchema),
            defaultValues: {
                question: pollData?.question ?? "",  // Ensures the question is pre-filled if pollData exists
                answerkey: returnString(pollData?.answerkey)
            }

        }
    );

    const onSubmit = async (data: CreateShortAnswerPollFormData) => {
        if (pollid) {
            await deleteOldPoll(pollid, classid);
        }

        console.log("SUCCESS", data);

        console.log('form data submitted:', data);

		const uid = user!.uid;

		const polldata: ShortPoll = {
			type: "short",
			classid: classid,
			question: data.question,
			answerkey: data.answerkey,
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

    const deleteOldPoll = async (pollId: string, classId: string) => {
        // Reference to the Firestore document
        const pollRef = doc(db, `classes/${classId}/polls`, pollId);
        // Reference to the Realtime Database path    
        try {
            // Delete from Firestore
            await deleteDoc(pollRef);
            console.log("Poll deleted from Firestore successfully");
    
        } catch (error) {
            console.error("Error deleting poll:", error);
        }
    };

    return (
        <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
            
            <Input<CreateShortAnswerPollFormData>
                type="text"
                label="Question"
                name="question"
                placeholder="Your Question"
                register={register}
                error={errors.question}
            />

            <Input<CreateShortAnswerPollFormData>
                type="text"
                label="Answer"
                name="answerkey"
                placeholder="Your Answer"
                register={register}
                error={errors.answerkey as any}
            />
            <Spacer />
            <Button type="submit" text="Submit" />

        </form>
    )
}