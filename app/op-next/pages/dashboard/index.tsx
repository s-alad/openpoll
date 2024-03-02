import { use, useEffect, useState } from "react"
import s from "./dashboard.module.scss"
import { faUser, faHome, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from "next/router";
import { db,auth } from "../../firebase/firebaseconfig";
import { collection, getDocs, where, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Classroom from "@/models/class";

export default function Dashboard() {

    const [classes, setClasses] = useState<Classroom[]>([]);

    async function getclass () {
        try {
        const user = auth.currentUser;
        const uid = user!.uid;

        const userClassesQuery = query(collection(db, "classes"), where("owner.uid", "==", uid));
        const userClassesSnapshot = await getDocs(userClassesQuery);
        const newClasses = userClassesSnapshot.docs.map((doc) => doc.data() as Classroom);
        setClasses(newClasses);
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }    

    const router = useRouter();

    async function enterclass(id: string) {
        router.push("/class/" + id);
    }

    useEffect(() => {
        getclass();
    }, []);

    return (
        <div className={s.dashboard}>
            <nav>
            <div className={s.path}><FontAwesomeIcon icon={faHome} onClick={() => router.back()} className={s.back}/> Courses / </div>
                <div className={s.person}>
                        <FontAwesomeIcon icon={faUser} />
                </div>
            </nav>
            <main className={s.main}>
            <div className={s.classes}>
                {classes.map((classData, index) => (
                
                        <div className={s.class}>
                            <div className={`${s.trap} ${s.yellow}`}></div>
                            <div className={`${s.content} ${s.yellow}`}>
                                <div className={s.info}>
                                    <div className={s.code}>{classData.classname}</div>
                                    <div className={s.name}>{classData.description}</div>
                                    <div className={s.teacher}>{classData.owner.name}</div>
                                </div>
                                <div className={s.actions}>
                                    <div className={s.join}
                                        onClick={() => {
                                            enterclass(classData.classid)
                                        }}
                                    >enter</div>
                                </div>
                            </div>  
                    </div>
                ))}
                </div>

                <div className={s.options}>
                    <div className={s.join}>
                        <FontAwesomeIcon icon={faRightToBracket} />
                        join a class
                    </div> 
                    <div className={s.create}
                        onClick={() => {
                            router.push("/create/class")
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        create a class
                    </div>
                </div>
                {/* <div className={s.classes}>
                    <div className={s.class}>
                        <div className={`${s.trap} ${s.yellow}`}></div>
                        <div className={`${s.content} ${s.yellow}`}>
                            <div className={s.info}>
                                <div className={s.code}>XYZ123</div>
                                <div className={s.name}>Introduction to Programming</div>
                                <div className={s.teacher}>Prof. John Doe</div>
                            </div>
                            <div className={s.actions}>
                                <div className={s.join}
                                    onClick={() => {
                                        enterclass("XYZ123")
                                    }}
                                >enter</div>
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
                                <div className={s.join}
                                    onClick={() => {
                                        enterclass("ABC456")
                                    }}
                                >enter</div>
                            </div>
                        </div>
                    </div>
                </div>
                */}
            </main>
        </div>
    )
}