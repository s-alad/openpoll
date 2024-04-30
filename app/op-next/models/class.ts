import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';


export interface Admins {
    emails: string[];
    details: {
        [uid: string]: {
            name: string;
            email: string;
        }
    }
}

export interface Class {
    cid: string;
    class: Classroom
}

class Classroom {
    admins: Admins
    classid: string;
    classname: string;
    description: string;
    owner: {
        uid: string;
        email: string;
        name: string;
    }
    classidentifier?: string;

    constructor(admins: Admins, classid: string, classname: string, description: string, owner: {uid: string, email: string, name: string}, students: Object, polls: Object, classidentifier?: string) {
        this.admins = admins;
        this.classid = classid;
        this.classname = classname;
        this.classidentifier = classidentifier;
        this.description = description;
        this.owner = owner;
    }
}

export async function getClassFromId(classid: string): Promise<Classroom | null> {
    const classref = doc(db, "classes", classid);
    const classDocSnapshot = await getDoc(classref);

    if (!classDocSnapshot.exists()) { return null; }
    const classDoc = classDocSnapshot.data() as Classroom;
    return classDoc
}

export async function getClassnameFromId(classid: string): Promise<string> {
    const classref = doc(db, "classes", classid);
    const classDocSnapshot = await getDoc(classref);

    if (!classDocSnapshot.exists()) {
        return "Class not found";
    }

    const classDoc = classDocSnapshot.data() as Classroom;
    return classDoc.classname;
}

export default Classroom;

