import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

export interface Class {
    cid: string;
    class: Classroom
}

class Classroom {
    admin: string[];
    classid: string;
    classname: string;
    description: string;
    owner: {
        uid: string;
        email: string;
        name: string;
    }
    classidentifier?: string;

    constructor(admin: string[], classid: string, classname: string, description: string, owner: {uid: string, email: string, name: string}, students: Object, polls: Object, classidentifier?: string) {
        this.admin = admin;
        this.classid = classid;
        this.classname = classname;
        this.classidentifier = classidentifier;
        this.description = description;
        this.owner = owner;
    }
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

