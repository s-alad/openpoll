import { faArrowLeftLong, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React from "react";

import s from "./navbar.module.scss";
import { useAuth } from "@/context/authcontext";

export default function Navbar() {

    const { user, logout, googlesignin } = useAuth();
    const router = useRouter();

    function matchRouterWithPath() {
        let staticmatches: { [key: string]: string } = {
            "/home": "Courses /",
            "/create/class": "Create a class /",
            "/create/poll": "Create a poll /",
        }
        let dynamicmatches:  { [key: string]: string } = {
            "/class": `Class / ${(router.query.classId as string ?? "").substring(0, 6)}`,
            "/dashboard": `Dashboard / ${(router.query.class as string ?? "").substring(0, 6)}`,
            "/poll": `Poll / ${router.query.poll}`,
            "/live": `Live / ${router.query.live}`,
        }

        if (staticmatches[router.pathname]) {
            return staticmatches[router.pathname];
        }
        
        for (let key in dynamicmatches) {
            if (router.pathname.startsWith(key)) {
                return dynamicmatches[key];
            }
        }
    }

    if (router.pathname === "/") {
        return null;
    }

    return (
        <nav className={s.navbar}>
            <div className={s.path}>

                {
                    router.pathname === "/home" ?
                        <FontAwesomeIcon icon={faHome} className={s.back} />
                        :
                        <FontAwesomeIcon icon={faArrowLeftLong} onClick={() => router.back()} className={s.back} />
                }
                {matchRouterWithPath()}
            </div>
            <div className={s.person}
                onClick={() => {
                    logout();
                }}
            >
                <FontAwesomeIcon icon={faUser} />
            </div>
        </nav>
    )
}