import React from "react";
import s from "./create-mc-poll.module.scss";
import Input from "@/ui/input/input";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CreateMultipleChoicePollFormData } from "@openpoll/packages/validation/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMultipleChoicePollData } from "@openpoll/packages/validation/schema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "@/ui/button/button";
import { Box, Chip, FormControl, MenuItem, OutlinedInput, Select } from "@mui/material";
import { useAuth } from "@/context/authcontext";
import { deleteDoc, addDoc, collection, doc } from "firebase/firestore";
import { remove, ref, set } from "firebase/database";
import { db, rdb } from "@openpoll/packages/config/firebaseconfig";
import { useRouter } from "next/router";
import Spacer from "@/components/spacer/spacer";
import MCPoll, { MCAnswerKey, MCOptions } from "@openpoll/packages/models/poll/mc";


type CreateMultipleChoicePollProps = {
    pollData?: MCPoll
    pollid?: string
}

export default function CreateMultipleChoicePoll({ pollData, pollid }: CreateMultipleChoicePollProps) {

    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const colorselection: { [key: string]: string } = { "A": s.a, "B": s.b, "C": s.c, "D": s.d }
    const initalpolls: MCOptions = [{ letter: "A", option: "" }, { letter: "B", option: "" }];

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<CreateMultipleChoicePollFormData>(
        {
            resolver: zodResolver(createMultipleChoicePollData),
            defaultValues: {
                question: pollData?.question ?? "",
                options: pollData?.options ?? initalpolls,
                answerkey: pollData?.answerkey ?? ["A"]
            }
        }
    );

    const { fields, append, remove, update, } = useFieldArray({
        control,
        name: "options"
    });

    const onSubmit = async (data: CreateMultipleChoicePollFormData) => {

        if (pollid) {
            await deleteOldPoll(pollid, classid);
        }    

        console.log("SUCCESS", data);
        console.log('form data submitted:', data);

		const uid = user!.uid;

		const polldata: MCPoll = {
			type: "mc",
			classid: classid,
			question: data.question,
			options: data.options,
			answerkey: data.answerkey,
			createdat: new Date(),
			creator: uid,
			responses: {},
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

            <Input<CreateMultipleChoicePollFormData>
                type="text"
                label="Question"
                name="question"
                placeholder="Your Question"
                register={register}
                error={errors.question}
            />

            <div className={s.options}>
                {
                    fields.map((field, index) => {
                        return (
                            <div className={s.option} key={index}>
                                <div className={`${s.letter} ${colorselection[field.letter]}`}>{field.letter}</div>
                                <Input<CreateMultipleChoicePollFormData>
                                    type={"text"}
                                    placeholder={"option"}
                                    register={register}
                                    name={`options.${index}.option` as const}
                                    error={errors.options?.[index]?.option}
                                />
                                {
                                    index === fields.length - 1 &&
                                    <div className={s.delete} onClick={() => { remove(index); }}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </div>
                                }
                            </div>
                        )
                    })
                }
            </div>

            <div className={s.add}>
                <FontAwesomeIcon icon={faPlus} onClick={
                    () => append({ letter: String.fromCharCode(65 + fields.length), option: "" })
                } />
            </div>

            <Controller
                name='answerkey'
                control={control}
                render={({ field }) => (
                    <FormControl className={s.multiselect}>
                        <label>Answers</label>
                        <Select
                            label={false}
                            multiple
                            value={field.value}
                            sx={{ height: 40, borderRadius: 8}}
                            onChange={field.onChange}
                            inputProps={
                                {
                                    MenuProps: {
                                        MenuListProps: { sx: { borderRadius: 8, } },
                                        PaperProps: { sx: { borderRadius: 0, }, }
                                    }
                                }
                            }
                            input={
                                <OutlinedInput
                                    style={{
                                        borderRadius: "4px",
                                        backgroundColor: "white",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 0,
                                        borderColor: "#6750A4",
                                        borderBlockColor: "#6750A4",
                                        outlineColor: "#6750A4",
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


            <Spacer />
            <Button type="submit" text="Submit"
                onClick={
                    () => console.log(errors)
                }
            />

        </form>
    )
}