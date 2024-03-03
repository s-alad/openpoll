import { useRouter } from 'next/router';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeftLong, faPlus } from '@fortawesome/free-solid-svg-icons';
import s from './class.module.scss';
import Link from 'next/link';

export default function Class() {

    // get the class id from the url
    const router = useRouter();

    return (
        <div className={s.class}>
            <div className={s.start}>
                <Link
                    href={{
                        pathname: '/create/poll',
                        query: { class: router.query.class }
                    }}
                >
                <div className={s.add}>
                    <FontAwesomeIcon icon={faPlus} />
                </div>
                </Link>
            </div>
        </div>
    )
}