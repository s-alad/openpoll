import { useAuth } from '@/context/authcontext';
import { rdb } from '@openpoll/packages/config/firebaseconfig';
import Poll, { getCorrectPollType, PollAndId } from "@openpoll/packages/models/poll";
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/button/button';
import s from '../respond-poll.module.scss';
import { ref, update } from 'firebase/database';
import AttendancePoll, { AttendanceResponses } from '@openpoll/packages/models/poll/attendance';
import OrderPoll, { OrderResponses, OrderResponseStructure } from '@openpoll/packages/models/poll/ordering';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

interface RespondOrderPollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondOrderPoll({ classid, poll }: RespondOrderPollProps) {

    const { user } = useAuth();
    const orderpoll = poll.poll as OrderPoll;

    const [sortedOptions, setSortedOptions] = useState(orderpoll.options);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function submit(data: any, pollId: string) {
        console.log(data);
        console.log(sortedOptions);
        setLoading(true);

        const responseStructure = sortedOptions.reduce<OrderResponseStructure>((acc, option, index) => {
            acc[index] = { letter: option.letter, option: option.option };
            return acc;
        }, {});

        console.log(responseStructure);

        let Sres = {
            [user!.uid]: {
                correct: false,
                email: user!.email,
                response: responseStructure
            }
        } as OrderResponses

        const answerRef = ref(rdb, `classes/${classid}/polls/${pollId}/responses`);
        await update(answerRef, Sres);

        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 1000);
    }

    const { handleSubmit, control, setValue, register, formState: { errors } } = useForm({});

    function SortableItem({ id, data }: { id: string, data: { letter: string, option: string } }): JSX.Element {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id });

        const style = transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            transition,
        } : {};

        return (
            <div /* ref={setNodeRef} style={style} {...attributes} {...listeners}  */ style={style} className={s.orderable}>
                <div className={`${s.letter}`}>{data.letter}</div>
                <div className={s.option}>{data.option}</div>
                <div className={s.drag} ref={setNodeRef}  {...attributes} {...listeners}>
                    <FontAwesomeIcon icon={faGripVertical} />
                </div>
            </div>
        );
    }


    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSortedOptions((currentItems) => {
                const oldIndex = currentItems.findIndex(item => item.letter === active.id);
                const newIndex = currentItems.findIndex(item => item.letter === over.id);
                return arrayMove(currentItems, oldIndex, newIndex);
            });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <form onSubmit={handleSubmit((data) => submit(data, poll.id))} className={s.poll}>
            <h1>{poll.poll.question}</h1>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sortedOptions.map(option => option.letter)} strategy={verticalListSortingStrategy}>
                    {sortedOptions.map(option => (
                        <SortableItem key={option.letter} id={option.letter} data={option} />
                    ))}
                </SortableContext>
            </DndContext>
            <Button type='submit' text='Submit' />
        </form>
    );
}