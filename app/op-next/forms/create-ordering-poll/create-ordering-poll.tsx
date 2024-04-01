import React from "react";
import s from "./create-ordering-poll.module.scss";
import Input from "@/ui/input/input";
import { useFieldArray, useForm } from "react-hook-form";
import { CreateOrderingPollFormData } from "@/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderingPollSchema } from "@/validation/schema";
import Button from "@/ui/button/button";
import { useAuth } from "@/context/authcontext";
import { addDoc, collection, doc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rdb } from "@/firebase/firebaseconfig";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";

export default function CreateOrderingPoll() {
    
    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<CreateOrderingPollFormData>(
        {
            resolver: zodResolver(createOrderingPollSchema),
        }
    );

    const onSubmit = async (data: CreateOrderingPollFormData) => {
        console.log("SUCCESS", data);

    }

    return (
        <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
            
            <Input<CreateOrderingPollFormData>
                type="text"
                label="Question"
                name="question"
                placeholder="Your Question"
                register={register}
                error={errors.question}
            />


            <Spacer />
            <Button type="submit" text="Submit" />

        </form>
    )
}