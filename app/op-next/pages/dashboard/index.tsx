import { useState } from "react"
import s from "./dashboard.module.scss"

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
            </nav>
        </div>
    )
}