import Image from 'next/image'
import { faArrowLeftLong, faHome, faUser, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React from "react";

import s from "./navbar.module.scss";
import { useAuth } from "@/context/authcontext";

export default function Navbar() {

    const { user, logout, googlesignin } = useAuth();
    const router = useRouter();

    const wheretogoback: { [key: string]: string } = {
        "/dashboard/[^/]+/?$": "/home",
        "/dashboard/([^/]+)/analytics": "/dashboard/$1",
        "/dashboard/([^/]+)/gradebook": "/dashboard/$1",
        "/class/[^/]+/?$": "/home",
        "/class/([^/]+)/grades/([^/]+)": "/class/$1/grades",
        "/class/([^/]+)/grades": "/class/$1",
    }

    function goback() {
        const pathname = router.asPath;
        for (let key in wheretogoback) {
            const regex = new RegExp(key);
            const match = regex.exec(pathname);
            if (match) {
                router.push(wheretogoback[key].replace(/\$1/g, match[1]).replace(/\$2/g, match[2]));
                return;
            }
        }

        router.back();
    }

    function matchRouterWithPath() {
        const router = useRouter();

        const ss = (s: string) => s.substring(0, 6);
    
        const routeMatches: Array<{
            pattern: RegExp,
            display?: string,
            displayFunc?: (match: RegExpExecArray) => string
        }> = [
            { pattern: /^\/home$/, display: "Dashboard /" },
            { pattern: /^\/create\/poll\/([^/]+)$/, displayFunc: (match) => `Dashboard / ${ss(match[1])} / Create A Poll` },
            { pattern: /^\/create\/class$/, display: "Create a class /" },
            { pattern: /^\/class\/([^/]+)$/, displayFunc: (match) => `Class / ${ss(match[1])} / Polls` },
            { pattern: /^\/class\/([^/]+)\/grades$/, displayFunc: (match) => `Class / ${ss(match[1])} / Grades` },
            { pattern: /^\/class\/([^/]+)\/grades\/([^/]+)$/, displayFunc: (match) => `Class / ${ss(match[1].substring(0, 6))} / Grades / ${ss(match[2])}`} ,
            { pattern: /^\/dashboard\/([^/]+)$/, displayFunc: (match) => `Dashboard / ${ss(match[1])} / Polls` },
            { pattern: /^\/dashboard\/([^/]+)\/analytics$/, displayFunc: (match) => `Dashboard / ${ss(match[1])} / Analytics` },
            { pattern: /^\/dashboard\/([^/]+)\/gradebook$/, displayFunc: (match) => `Dashboard / ${ss(match[1])} / Gradebook` },
            { pattern: /^\/live\/([^/]+)\/([^/]+)$/, displayFunc: (match) => `Dashboard / ${ss(match[1])} / Live / ${ss(match[2])}`},
        ];
    
        const pathname = router.asPath.split('?')[0]; // Removing query parameters for matching
    
        for (const { pattern, display, displayFunc } of routeMatches) {
            const match = pattern.exec(pathname);
            if (match) {
                // If there's a display function, call it with the match object to generate the display string
                if (displayFunc) {
                    return displayFunc(match);
                }
                // Otherwise, return the static display string
                return display;
            }
        }
    }

    if (router.pathname === "/") {
        return null;
    }

    return (
        <nav className={s.navbar}>
            <div className={s.navbarLeftItems}>
                <Image
                    src="/OpenPollLogo1.png"
                    alt="Open Poll Logo"
                    width={75}
                    height={75}
                    className={s.logo}
                />
                <div className={s.path}>
                    {
                        router.pathname === "/home" ?
                            <FontAwesomeIcon icon={faHome} className={s.back} />
                            :
                            <FontAwesomeIcon icon={faArrowLeftLong} onClick={goback} className={s.back} />
                    }
                    {matchRouterWithPath()}
                </div>
            </div>

            <div className={s.navbarRightItems} onClick={() => {logout();}}>
                <div className={s.person}>
                    <FontAwesomeIcon icon={faUserCircle} size='2x'/>
                </div>

                <div className={s.personName}>{user?.displayName}</div>
            </div>
        </nav>
    )
}