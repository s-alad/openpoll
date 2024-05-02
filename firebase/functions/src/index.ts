/**
 * triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// --------------------------------------------------------------------------------------------
// function to add user to firestore on account creation
export const onAccountCreated = functions.auth.user().onCreate(async (user) => {
    try {
        const { uid, email, displayName } = user;

        // Add user information to Firestore
        await admin.firestore().collection("users").doc(email || uid).set({
            email,
            uid,
            name: displayName || "",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${email + uid} added to Firestore.`);
    } catch (error) {
        console.error("Error adding user to Firestore:", error);
    }
});
// --------------------------------------------------------------------------------------------



// --------------------------------------------------------------------------------------------
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
});
// --------------------------------------------------------------------------------------------



// --------------------------------------------------------------------------------------------
async function calculatePollResults(pollid: string, classid: string) {

    // get the poll from the firestore
    const pollRef = await admin.firestore().collection("classes").doc(classid).collection("polls").doc(pollid);
    const pollDoc = await pollRef.get();
    const pollData = pollDoc.data();
    console.log("DATA_---->", pollData);

    const polltype = pollData?.type;
    const answerkey = pollData?.answerkey;
    const responses = pollData?.responses;

    if (polltype === "mc") {
        console.log("CALCULATING MC POLL RESULTS");
        for (const [userid, userResponse] of Object.entries(responses)) {
            const response = (userResponse as any).response // type MCResponses
            
            // check if the response is equal to the answer key
            const correct = response.join() === answerkey.join();
            console.log("CORRECT - RESPONSE", correct, response);

            await pollRef.update({
                [`responses.${userid}.correct`]: correct
            });
        }
    } else if (polltype === "short") {
        console.log("CALCULATING SHORT POLL RESULTS");
        
        if (!answerkey) {
            console.log("No answer key for short answer poll, marking all responses as correct.");

            for (const [userid, _] of Object.entries(responses)) {
                await pollRef.update({[`responses.${userid}.correct`]: true});
            }
            return;
        } else {
            for (const [userid, userResponse] of Object.entries(responses)) {
                const response = (userResponse as any).response;
                const correct = response === answerkey;
                console.log("CORRECT - RESPONSE", correct, response);

                await pollRef.update({
                    [`responses.${userid}.correct`]: correct
                });
            }
        }
    } else if (polltype === "order") {
        console.log("CALCULATING ORDER POLL RESULTS");

        for (const [userid, userResponse] of Object.entries(responses)) {
            const response = (userResponse as any).response; // type OrderResponses


            // convert response which looks like [{letter: "A", option: "Option 1"}, {letter: "B", option: "Option 2"}]
            // into a map that looks like {0: {letter: "A", option: "Option 1"}, 1: {letter: "B", option: "Option 2"}}
            const responseMap = response.reduce((acc: any, item: any, index: number) => {
                acc[index] = item;
                return acc;
            }, {});

            console.log("RESPONSE MAP", responseMap);
            console.log("ANSWER KEY", answerkey);
            
            // check if the response is equal to the answer key
            const correct = JSON.stringify(responseMap) === JSON.stringify(answerkey);
            console.log("CORRECT - RESPONSE", correct);

            await pollRef.update({
                [`responses.${userid}.correct`]: correct
            });
            
        }
    } else if (polltype === "matching") {
        console.log("CALCULATING MATCHING POLL RESULTS");
    } else if (polltype === "tf") {
        console.log("CALCULATING TF POLL RESULTS") 

        for (const [userid, userResponse] of Object.entries(responses)) {
            const response = (userResponse as any).response; // type TrueFalseResponses
            const correct = response.response === answerkey;
            console.log("CORRECT - RESPONSE", correct, response);

            await pollRef.update({
                [`responses.${userid}.correct`]: correct
            });
        }
    }
}

export const transferAndCalculatePollResults = functions.https.onCall(async (data, context) => {

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

        console.log(pollResponses);

        // Transfer to Firestore
        if (pollResponses) {
            await firestore.collection('classes').doc(classId).collection("polls").doc(pollId).update({
                responses: pollResponses,
                endedat: admin.firestore.FieldValue.serverTimestamp(),
                done: true
            });
            console.log(`Poll results for ${pollId} transferred to Firestore.`);
            await calculatePollResults(pollId, classId);
            return { result: `Poll results for ${pollId} transferred to Firestore.` };
        } else {
            await firestore.collection('classes').doc(classId).collection("polls").doc(pollId).update({
                responses: {},
                endedat: admin.firestore.FieldValue.serverTimestamp(),
                done: true
            });
            return { result: 'No responses to transfer.' };
        }
    } catch (error) {
        console.error("Error transferring poll results: ", error);
        throw new functions.https.HttpsError('unknown', `Failed to transfer poll results: `);
    }
});
// --------------------------------------------------------------------------------------------
