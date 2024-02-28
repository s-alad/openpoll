import { use, useEffect, useState } from "react"
import s from "./dashboard.module.scss"
import { faUser, faHome, faPlus, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from "next/router";
import { db,auth } from "../../firebase/firebaseconfig";
import { collection, getDocs, where, query } from "firebase/firestore";

interface ClassData {
    className: string;
    description: string;
    owner: string;
    admin: string[];
    students: string[];
    questions: string[];
}

export default function Dashboard() {

    const [classes, setClasses] = useState<ClassData[]>([]);

    async function getClass () {
        try {
        const user = auth.currentUser;
        const uid = user!.uid;

        const userClassesQuery = query(collection(db, "classes"), where("owner", "==", uid));
        const userClassesSnapshot = await getDocs(userClassesQuery);
        userClassesSnapshot.forEach((doc) => {
            setClasses((prevClasses) => [...prevClasses, doc.data() as ClassData]);
          });
        } catch (e) {
            console.error("Error getting documents: ", e);
        }
    }    

    const router = useRouter();

    async function enterclass(id: string) {
        router.push("/class/" + id);
    }

    useEffect(() => {
        getClass();
    }, [])
    
    return (
        <div className={s.dashboard}>
            <nav>
            <div className={s.path}><FontAwesomeIcon icon={faHome} onClick={() => router.back()} className={s.back}/> Courses / </div>
                <div className={s.person}>
                        <FontAwesomeIcon icon={faUser} />
                </div>
            </nav>
            <main className={s.main}>
                {classes.map((classData, index) => (
                    <div key={index} className={s.classes}>
                        <div className={s.class}>
                        <div className={`${s.trap} ${classData.color}`}></div>
                        <div className={`${s.content} ${classData.color}`}>
                            <div className={s.info}>
                            <div className={s.code}>{classData.className}</div>
                            <div className={s.name}>{classData.description}</div>
                            <div className={s.teacher}>{classData.teacher}</div>
                            </div>
                            <div className={s.actions}>
                            <div
                                className={s.join}
                                onClick={() => {
                                enterclass(classData.className);
                                }}
                            >
                                enter
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                ))}
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
                </div> */}
            </main>
        </div>
    )
}