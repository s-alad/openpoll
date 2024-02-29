/**
 * triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from 'uuid';

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

// function to generate a unique memorable 5 digit class id
export const generateClassId = functions.https.onCall(async (data, context) => {
    
    const checkUniqueId = async (id: string) => {
        const doc = await admin.firestore().collection("classes").doc(id).get();
        return doc.exists;
    }

    const generateId = () => {
        return uuidv4().split("-")[0].toUpperCase();
    }

    let id = generateId();
    while (await checkUniqueId(id)) {
        id = generateId();
    }

    return {
        id
    }
})