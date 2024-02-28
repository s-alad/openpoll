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

// function to generate a unique memorable 5 digit class id
export const generateClassId = functions.https.onCall(async (data, context) => {
    
    const checkUniqueId = async (id: string) => {
        const doc = await admin.firestore().collection("classes").doc(id).get();
        return doc.exists;
    }

    const generateId = () => {
        let id = '';
        while (true) {
            const randomNumber = Math.floor(10000 + Math.random() * 90000);
            id = randomNumber.toString();

            // Check for at least two repeating consecutive digits
            if (/(\d)\1{1,}/.test(id)) break; 
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