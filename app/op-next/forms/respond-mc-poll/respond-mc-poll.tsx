import { useAuth } from '@/context/authcontext';
import { rdb } from '@/firebase/firebaseconfig';
import {
    Checkbox,
    FormControlLabel
} from '@mui/material';
import Poll, { getCorrectPollType, PollAndId } from "@/models/poll";
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/button/button';
import s from '../respond-poll.module.scss';
import MCPoll, { MCResponses } from '@/models/poll/mc';
import { ref, update } from 'firebase/database';

interface RespondMcPollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondMcPoll({ classid, poll }: RespondMcPollProps) {

    const { user } = useAuth();
    const mcpoll = poll.poll as MCPoll;

    async function submitMCPoll(data: { [key: string]: boolean }, pollid: string) {
        const selectedOptions = Object.keys(data).filter((key) => data[key]);
        console.log(selectedOptions);
        console.log(data);

        let MCresponse = {
            [user!.uid]: {
                email: user!.email,
                correct: false,
                response: selectedOptions
            }
        } as MCResponses

        const responseref = ref(rdb, `classes/${classid}/polls/${pollid}/responses`);
        await update(responseref, MCresponse);
    }

    const { handleSubmit, control, register, formState: { errors } } = useForm({});

    return (
        <form key={poll.id} className={s.poll} onSubmit={handleSubmit((data) => submitMCPoll(data, poll.id))}>
            <h1>{mcpoll.question}</h1>
            <div className={s.options}>
                {
                    mcpoll.options.map((option) => {
                        return (
                            <div key={option.letter} className={s.option}>
                                <Controller
                                    control={control}
                                    name={option.letter}
                                    defaultValue={
                                        mcpoll.responses && mcpoll.responses[option.letter] && user!.uid in mcpoll.responses[option.letter]
                                    }
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    {...field}
                                                    defaultChecked={mcpoll.responses && mcpoll.responses[option.letter] && user!.uid in mcpoll.responses[option.letter]}
                                                />
                                            }
                                            label={option.letter}
                                        />
                                    )}
                                />

                                <div className={s.content}>{option.option}</div>
                            </div>
                        )
                    })
                }
            </div>

            <Button type='submit' text='Submit' />
        </form>
    )
}