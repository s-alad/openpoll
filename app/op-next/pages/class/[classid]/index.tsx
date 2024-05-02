import { useAuth } from '@/context/authcontext';
import { rdb } from '@openpoll/packages/config/firebaseconfig';
import {
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { equalTo, onValue, orderByChild, query, ref, remove, set, update } from 'firebase/database';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import s from './class.module.scss';
import Button from '@/ui/button/button';
import MCPoll, { MCResponses } from '@openpoll/packages/models/poll/mc';
import ShortPoll, { ShortResponses } from '@openpoll/packages/models/poll/short';
import AttendancePoll, { AttendanceResponses } from '@openpoll/packages/models/poll/attendance';
import Loader from '@/components/loader/loader';
import OrderPoll from '@openpoll/packages/models/poll/ordering';
import Poll, { getCorrectPollType, PollAndId } from "@openpoll/packages/models/poll";
import MatchPoll from '@openpoll/packages/models/poll/matching';
import RespondMcPoll from '@/forms/respond-mc-poll/respond-mc-poll';
import RespondAttendancePoll from '@/forms/respond-attendance-poll/respond-attendance-poll';
import RespondShortPoll from '@/forms/respond-short-poll/respond-short-poll';
import RespondOrderPoll from '@/forms/respond-ordering-poll/respond-ordering-poll';
import RespondTrueFalsePoll from '@/forms/respond-true-false-poll/respond-true-false-poll';
import { getClassnameFromId } from '@openpoll/packages/models/class';

export default function Class() {

    const router = useRouter();
    const classid = router.query.classid;

    const { user, loading: authloading } = useAuth();
    const [loading, setLoading] = useState(false);

    const [activePolls, setActivePolls] = useState<PollAndId[]>([]);
    const [classname, setClassname] = useState<string>("");

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

    // execute necessary functions
    async function main() {
        setLoading(true);
        const classname = await getClassnameFromId(classid as string);
        setClassname(classname);
        setLoading(false);
    }

    //wait for router to load
    useEffect(() => {
        if (user && classid) {
            main();
        }
    }, [classid]);
    if (!user || authloading || !classid) { return (<div></div>) }

    if (!user || !classid) return (<Loader />)

    return (
        <div className={s.class}>
            <div className={s.openpolls}>
            <div className={s.info}>
                <div className={s.classname}>
                    {classname}
                </div>
                <div className={s.date}>
                    {new Date().toLocaleDateString()}
                </div>
            </div></div>
            {activePolls.length === 0 && <div className={s.openpolls}> no active polls </div>}
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
                                <RespondOrderPoll key={poll.id} classid={classid as string} poll={poll} />
                            );

                            /* if (type === "match") return (
                                <div>Respond Poll Poll</div>
                            ); */

                            if (type === "tf") return (
                                <RespondTrueFalsePoll key={poll.id} classid={classid as string} poll={poll} />
                            );
                        })
                    }
                </div>
            }
        </div>
    )
}