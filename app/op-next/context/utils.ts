import { auth, db, fxns } from "../firebase/firebaseconfig";
import { collection, doc, getDoc, query as q, updateDoc } from "firebase/firestore";
import { TPoll, xPoll } from "@/models/poll";
export async function getPollTypeFromId(classId: string, pollId: string) {
    const pollRef = doc(db, `classes/${classId}/polls/${pollId}`);
    const pollDoc = await getDoc(pollRef);
    if (!pollDoc.exists()) return null;
    const pollData = pollDoc.data();
    if (!pollData) return null;
    return pollData.type as TPoll;
}