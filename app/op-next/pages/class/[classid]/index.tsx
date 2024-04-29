import { useAuth } from '@/context/authcontext';
import { rdb } from '@/firebase/firebaseconfig';
import {
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { equalTo, onValue, orderByChild, query, ref, remove, update } from 'firebase/database';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import s from './class.module.scss';
import Button from '@/ui/button/button';
import MCPoll, { MCResponses } from '@/models/poll/mc';
import ShortPoll, { ShortResponses } from '@/models/poll/short';
import AttendancePoll, { AttendanceResponses } from '@/models/poll/attendance';
import Loader from '@/components/loader/loader';
import OrderPoll from '@/models/poll/ordering';
import Poll, { getCorrectPollType, PollAndId } from "@/models/poll";
import MatchPoll from '@/models/poll/matching';
import RespondMcPoll from '@/forms/respond-mc-poll/respond-mc-poll';
import RespondAttendancePoll from '@/forms/respond-attendance-poll/respond-attendance-poll';
import RespondShortPoll from '@/forms/respond-short-poll/respond-short-poll';
import RespondOrderPoll from '@/forms/respond-ordering-poll/respond-ordering-poll';

export default function Class() {

    const router = useRouter();
    const classid = router.query.classid;

    const { user } = useAuth();

    const [activePolls, setActivePolls] = useState<PollAndId[]>([]);

    // THIS IS INSECURE AS IT RETURNS ANSWERKEY TO CLIENT
    useEffect(() => {
        const pollsRef = query(ref(rdb, `classes/${classid}/polls`), orderByChild('active'), equalTo(true));
        const unsubscribe = onValue(pollsRef, (snapshot) => {
            const polls = snapshot.val();
            console.log(polls);

            let newpolls: PollAndId[] = [];
            for (const key in polls) {
                const poll = polls[key];
                const polltype = getCorrectPollType(poll);
                if (polltype) newpolls.push({ id: key, poll: polltype });
            }
            setActivePolls(newpolls);
        });

        return () => unsubscribe();
    }, [classid]);


    if (!user || !classid) return (<Loader />)

    return (
        <div className={s.class}>
            { activePolls.length === 0 && <div className={s.openpolls}> no active polls </div> }
            {
                activePolls.length > 0 &&
                <div className={s.openpolls}>
                    {
                        activePolls.map((poll, idx) => {
                            const type = poll.poll.type;

                            if (type === "mc") return (
                                <RespondMcPoll key={poll.id} classid={classid as string} poll={poll} />
                            )

                            if (type === "short") return (
                                <RespondShortPoll key={poll.id} classid={classid as string} poll={poll} />
                            )

                            if (type === "attendance") return (
                                <RespondAttendancePoll key={poll.id} classid={classid as string} poll={poll} />
                            );

                            if (type === "order") return (
                                <RespondOrderPoll  key={poll.id} classid={classid as string} poll={poll} />
                            );

                            if (type === "match") return (
                                <div>Match Poll</div>
                            );
                        })
                    }
                </div>
            }
        </div>
    )
}