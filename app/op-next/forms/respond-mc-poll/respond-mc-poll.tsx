import { useAuth } from '@/context/authcontext';
import { rdb } from '@openpoll/packages/config/firebaseconfig';
import {
    Checkbox,
    FormControlLabel
} from '@mui/material';
import Poll, { getCorrectPollType, PollAndId } from "@openpoll/packages/models/poll";
import { Controller, useForm } from 'react-hook-form';
import Button from '@/ui/button/button';
import s from '../respond-poll.module.scss';
import MCPoll, { MCResponses } from '@openpoll/packages/models/poll/mc';
import { ref, update } from 'firebase/database';
import { useState } from 'react';

interface RespondMcPollProps {
    classid: string;
    poll: PollAndId;
}

export default function RespondMcPoll({ classid, poll }: RespondMcPollProps) {

    const [loading, setLoading] = useState(false);
    const [sucess, setSuccess] = useState(false);

    const { user } = useAuth();
    const mcpoll = poll.poll as MCPoll;

    async function submitMCPoll(data: { [key: string]: boolean }, pollid: string) {
        setLoading(true);
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
        setLoading(false);
        // set success for 2 seconds
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 1000);
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
            {

            }
            <Button type='submit' text='Submit' loading={loading} success={sucess} />
        </form>
    )
}