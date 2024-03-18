/**
 * triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// function to add user to firestore on account creation
export const onAccountCreated = functions.auth.user().onCreate(async (user) => {
    try {
        const { uid, email, displayName } = user;

        // Add user information to Firestore
        await admin.firestore().collection("users").doc(email || uid).set({
            email,
            uid,
            name: displayName,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${email + uid} added to Firestore.`);
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
    }
});

// function that runs whenever a document is created in the classes collection
// it takes the classId and adds a field that is the first 6 characters of the classId
export const onClassCreated = functions.firestore.document("classes/{classId}").onCreate(async (snapshot, context) => {
    try {
        const { classId } = context.params;
        const classid = classId.slice(0, 6);
        await snapshot.ref.update({
            classid
        });
        console.log(`Class ${classId} added to Firestore.`);
    } catch (error) {
        console.error("Error adding class to Firestore:", error);
    }
})

// function to generate a unique memorable 5 digit class id
export const generateClassId = functions.https.onCall(async (data, context) => {
    
    const checkUniqueId = async (id: string) => {
        // check the classes document, then check the fields for the id
        const classes = admin.firestore().collection("classes");
        const query = await classes.where("id", "==", id).get();
        return query.docs.length > 0;
    }

    const generateId = () => {
        // make a six digit alphanumeric id
        let id = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return id;
    }

    let id = generateId();
    while (await checkUniqueId(id)) {
        id = generateId();
    }

    return {
        id
    }
})


export const transferPollResults = functions.https.onCall(async (data) => {
    const pollId = data.pollId;
    const classId = data.classId;
    if (!pollId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with one argument "pollId".');
    }

    try {
        const firestore = admin.firestore();
        const realtimeDatabase = admin.database();

        // Read the poll responses from the Realtime Database
        const pollResponsesSnapshot = await realtimeDatabase.ref("/classes/"+classId+"/polls/"+pollId+"/responses").once('value');
        const pollResponses = pollResponsesSnapshot.val();

        // Transfer to Firestore
        if (pollResponses) {
            await firestore.collection('classes').doc(classId).collection("polls").doc(pollId).update({
                responses: pollResponses,
                endedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Poll results for ${pollId} transferred to Firestore.`);
            return { result: `Poll results for ${pollId} transferred to Firestore.` };
        } else {
            return { result: 'No responses to transfer.' };
        }
    } catch (error) {
        console.error("Error transferring poll results: ", error);
        throw new functions.https.HttpsError('unknown', `Failed to transfer poll results: `);
    }
});