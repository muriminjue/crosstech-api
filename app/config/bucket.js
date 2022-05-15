const admin = require("firebase-admin");
const serviceAccount = require("../../crosstech-erp-firebase-adminsdk-8fx0y-9072f0db80.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "crosstech-erp.appspot.com"
});

let bucket = admin.storage().bucket();

module.exports = bucket
