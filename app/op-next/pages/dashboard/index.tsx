import { useState } from "react"
import s from "./dashboard.module.scss"
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Dashboard() {
    
    return (
        <div className={s.dashboard}>
            <nav>
                <div className={s.path}>Courses /</div>
                <div className={s.person}>
                        <FontAwesomeIcon icon={faUser} />
                </div>
            </nav>
            <main className={s.main}>
                <div className={s.classes}>
                    <div className={s.class}>
                        <div className={`${s.trap} ${s.yellow}`}></div>
                        <div className={`${s.content} ${s.yellow}`}>
                            <div className={s.info}>
                                <div className={s.code}>XYZ123</div>
                                <div className={s.name}>Introduction to Programming</div>
                                <div className={s.teacher}>Prof. John Doe</div>
                            </div>
                            <div className={s.actions}>
                                <div className={s.join}>join</div>
                            </div>
                        </div>
                    </div>

                    <div className={s.class}>
                        <div className={`${s.trap} ${s.pink}`}></div>
                        <div className={`${s.content} ${s.pink}`}>
                            <div className={s.info}>
                                <div className={s.code}>ABC456</div>
                                <div className={s.name}>Introduction to Bank Robbery</div>
                                <div className={s.teacher}>Prof. Jane Doe</div>
                            </div>
                            <div className={s.actions}>
                                <div className={s.join}>join</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}