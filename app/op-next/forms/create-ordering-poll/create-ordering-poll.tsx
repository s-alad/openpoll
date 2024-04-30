import React, { useEffect } from "react";
import s from "./create-ordering-poll.module.scss";
import Input from "@/ui/input/input";
import { FieldArrayWithId, UseFormRegister, useFieldArray, useForm } from "react-hook-form";
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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import OrderPoll from "@openpoll/packages/models/poll/ordering";


function SortableItem({ register, index, error, field, end, callback }:
    {
        register: UseFormRegister<CreateOrderingPollFormData>;
        index: number,
        error: any,
        field: FieldArrayWithId<CreateOrderingPollFormData, "options", "id">,
        end: boolean,
        callback: (index: number) => void
    }
) {

    const id = field.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const colorselection: { [key: string]: string } = { "A": s.a, "B": s.b, "C": s.c, "D": s.d }

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
    } : {};


    return (
        <div /* ref={setNodeRef} style={style} {...attributes} {...listeners}  */ style={style} className={s.orderable}>
            <div className={`${s.letter} ${colorselection[field.letter]}`}>{field.letter}</div>
            <Input<CreateOrderingPollFormData>
                type="text"
                name={`options.${index}.option`}
                register={register}
                placeholder="Option text"
                error={error}
            />
            {
                end &&
                <div className={s.delete} onClick={() => {
                    console.log("delete", index);
                    callback(index)
                    }}>
                    <FontAwesomeIcon icon={faTrash} />
                </div>
            }
            <div className={s.drag} ref={setNodeRef}  {...attributes} {...listeners}>
                <FontAwesomeIcon icon={faGripVertical} />
            </div>
        </div>
    );
}

export default function CreateOrderingPoll() {

    const { user } = useAuth();
    const router = useRouter();
    const classid = router.query.classid as string;

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        control,
        formState: { errors },
        setError,
        watch
    } = useForm<CreateOrderingPollFormData>(
        {
            resolver: zodResolver(createOrderingPollSchema),
            defaultValues: {
                question: "",
                options: [{ letter: "A", option: "A" }, { letter: "B", option: "B" }],
                answerkey: {}
            },
        }
    );

    const watchedOptions = watch("options");

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "options",
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    type AnswerType = {
        [key: string]: {
            letter: string;
            option: string;
        };
    };

    const onSubmit = async (data: CreateOrderingPollFormData) => {
        console.log("SUCCESS", data);


        const updatedAnswer: AnswerType = fields.reduce((acc: AnswerType, field, index) => {
            const currentOptionValue = getValues(`options.${index}.option`);
            acc[index] = { letter: field.letter, option: currentOptionValue };
            return acc;
        }, {});

        console.log(updatedAnswer);

        const uid = user!.uid;

        const polldata: OrderPoll = {
            type: "order",
			classid: classid,
			question: data.question,
			options: data.options,
			answerkey: updatedAnswer,
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

    useEffect(() => {
    
        const updatedAnswer: AnswerType = fields.reduce((acc: AnswerType, field, index) => {
            const currentOptionValue = getValues(`options.${index}.option`);
            acc[index] = { letter: field.letter, option: currentOptionValue };
            return acc;
        }, {});

        console.log(updatedAnswer);
    
        setValue('answerkey', updatedAnswer, { shouldValidate: true });
    }, [fields, getValues, setValue]);

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

            <div className={s.ordered}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
                    if (active.id !== over?.id) {
                        const oldIndex = fields.findIndex(field => field.id === active.id);
                        const newIndex = fields.findIndex(field => field.id === over?.id);
                        move(oldIndex, newIndex);

                        console.log("fields", fields);
                    }
                }}>
                    <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                        {fields.map((field, index) => {
                            return (
                                <SortableItem
                                    key={field.id}
                                    index={index}
                                    field={field}
                                    register={register}
                                    error={errors.options ? errors.options[index] : undefined}
                                    end={index === fields.length - 1}
                                    callback={(index) => remove(index)}
                                />
                            )
                        })}
                    </SortableContext>
                </DndContext>
            </div>

            <div className={s.add}>
                <FontAwesomeIcon icon={faPlus} onClick={
                    () => append({ letter: String.fromCharCode(65 + fields.length), option: "" })
                } />
            </div>

            <Spacer />
            <Button type="submit" text="Submit" onClick={
                () => {
                    console.log("submit");
                    console.log(errors)
                }
            } />

        </form>
    )
}