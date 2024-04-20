interface Classroom {
    classname: string;
    description: string;
    owner: {
        uid: string;
        email: string;
        name: string;
    }
    admin: string[];
    students: string[];
    questions: string[];
    classid: string;
}

export default Classroom;

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

export async function getClassnameFromId(classid: string): Promise<string> {
    const classref = doc(db, "classes", classid);
    const classDocSnapshot = await getDoc(classref);

    if (!classDocSnapshot.exists()) {
        return "Class not found";
    }

    const classDoc = classDocSnapshot.data() as Classroom;
    return classDoc.classname;
}