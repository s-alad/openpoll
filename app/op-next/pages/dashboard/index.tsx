import { useState } from "react"
import s from "./dashboard.module.scss"
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Format of Class Data necessary for screen
interface ClassData {
    classID: string,
    className: string,
    owners: string[]
}

export default function Dashboard() {
    
    return (
        <div className={s.dashboard}>
            <nav>
                <div className={s.path}>Courses /</div>

                <div className={s.person}>
                        <FontAwesomeIcon icon={faUser} />
                </div>
            </nav>
        </div>
    )
}