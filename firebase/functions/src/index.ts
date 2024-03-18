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