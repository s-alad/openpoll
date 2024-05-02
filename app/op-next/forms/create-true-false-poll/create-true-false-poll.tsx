import React from "react";
import s from "./create-true-false-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateMultipleChoicePollFormData, CreateShortAnswerPollFormData, CreateTrueFalsePollFormData } from "@openpoll/packages/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMultipleChoicePollData, createShortAnswerPollSchema, createTrueFalsePollSchema } from "@openpoll/packages/validation/schema";
import Button from "@/ui/button/button";
import { useAuth } from "@/context/authcontext";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rdb } from "@openpoll/packages/config/firebaseconfig";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";
import ShortPoll from "@openpoll/packages/models/poll/short";
import TrueFalsePoll from "@openpoll/packages/models/poll/truefalse";

interface RadioInputProps {
    label: string;
    name: string;
    value: "true" | "false";
    register: any;
    defaultChecked?: boolean;
}

export function RadioInput({ label, name, value, register, defaultChecked }: RadioInputProps) {
    return (
        <div className={s.truefalse}>
            <input
                type="radio"
                id={`radio-${value}`}
                value={value}
                {...register(name)}
                defaultChecked={defaultChecked}
                className={s.hidden}
            />
            <label htmlFor={`radio-${value}`} className={`${s.selectable} ${defaultChecked ? s.selected : ""}`}>
                {label}
            </label>
        </div>
    )
}


type CreateTrueFalsePollProps = {
    pollData?: TrueFalsePoll
    pollid?: string
}

export default function CreateTrueFalsePoll({ pollData, pollid }: CreateTrueFalsePollProps) {

    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
        watch
    } = useForm<CreateTrueFalsePollFormData>(
        {
            resolver: zodResolver(createTrueFalsePollSchema),
            defaultValues: {
                question: pollData?.question ?? "",  // Ensures the question is pre-filled if pollData exists
                answerkey: "false"
            }

        }
    );
    const ischecked = watch("answerkey");

    const onSubmit = async (data: CreateTrueFalsePollFormData) => {
        /* if (pollid) {
            await deleteOldPoll(pollid, classid);
        } */

        console.log("SUCCESS", data);

        console.log('form data submitted:', data);

        const uid = user!.uid;

        const polldata: TrueFalsePoll = {
            type: "tf",
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

            <Input<CreateTrueFalsePollFormData>
                type="text"
                label="Question"
                name="question"
                placeholder="Your Question"
                register={register}
                error={errors.question}
            />

            <div className={s.tf}>
                <RadioInput
                    label="True"
                    value="true"
                    name="answerkey"
                    register={register}
                    defaultChecked={ischecked === "true"}
                />
                <RadioInput
                    label="False"
                    value="false"
                    name="answerkey"
                    register={register}
                    defaultChecked={ischecked === "false"}
                />
            </div>

            <Spacer />
            <Button type="submit" text="Submit" />

        </form>
    )
}