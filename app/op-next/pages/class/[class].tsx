import { useRouter } from 'next/router';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './class.module.scss';

export default function Class() {

    // get the class id from the url
    const router = useRouter();

    const { class: classId } = router.query;

    async function createpoll() {
        router.push("/polls");
    }


    return (
        <div className={s.class}>
            <div className={s.start}>
                <div className={s.add}
                    onClick={() => {
                        createpoll()
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </div>
            </div>
        </div>
    )
}