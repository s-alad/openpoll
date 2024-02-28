import { faArrowLeftLong, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React from "react";

import s from "./navbar.module.scss";

interface Navbar {
    path: string;
}

export default function Navbar({ path }: Navbar) {

    const router = useRouter();

    return (
        <nav className={s.navbar}>
            <div className={s.path}><FontAwesomeIcon icon={faArrowLeftLong} onClick={() => router.back()} className={s.back} />{path}</div>
            <div className={s.person}>
                <FontAwesomeIcon icon={faUser} />
            </div>
        </nav>
    )
}