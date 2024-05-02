import s from './create.poll.module.scss';
import { auth, db, fxns, rdb } from '@openpoll/packages/config/firebaseconfig';
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState, FormEvent, useEffect } from 'react';
import { push, ref, set } from 'firebase/database';
import CreateShortAnswerPoll from '@/forms/create-short-poll/create-short-poll';
import CreateMultipleChoicePoll from '@/forms/create-mc-poll/create-mc-poll';
import CreateOrderingPoll from '@/forms/create-ordering-poll/create-ordering-poll';
import { CreateAttendancePollFormData } from '@openpoll/packages/validation/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceSchema } from '@openpoll/packages/validation/schema';
import Button from '@/ui/button/button';
import Spacer from '@/components/spacer/spacer';
import { TLPoll, TPoll, convertPollTypeToText } from '@openpoll/packages/models/poll';
import CreateAttendancePoll from '@/forms/create-attendance-poll/create-attendance-poll';
import CreateTrueFalsePoll from '@/forms/create-true-false-poll/create-true-false-poll';

export default function CreatePoll() {

	const router = useRouter();
	const classid = router.query.classid
	console.log(classid);

	const [polltype, setpolltype] = useState<TPoll>("mc");

	return (
		<>
			<main className={s.createpoll}>
				<div className={s.create}>

					<div className={s.selector}>
						{
							TLPoll.map(type => (
								<div
									key={type}
									onClick={() => setpolltype(type as TPoll)}
									className={polltype === type ? s.selected : ""}
								>
									{convertPollTypeToText(type as TPoll)}
								</div>
							))
						}
					</div>
					{
						polltype === "mc" && <CreateMultipleChoicePoll />
					}
					{
						polltype === "short" && <CreateShortAnswerPoll />
					}
					{
						polltype === "order" && <CreateOrderingPoll />
					}
					{
						polltype === "attendance" && <CreateAttendancePoll />
					}
					{
						polltype === "tf" && <CreateTrueFalsePoll />
					}
				</div>
			</main>
		</>
	);
}
