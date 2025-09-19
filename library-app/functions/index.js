/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Remove unused imports above

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

/**
 * Creates a student user in Firebase Auth and Firestore.
 * @param {Object} param0
 * @param {string} param0.name
 * @param {string} param0.dob
 * @param {string} param0.className
 * @param {string} param0.password
 * @returns {Promise<Object>} The new student's ID and email.
 */
// Helper to create a student user
async function createStudent({name, dob, className, password}) {
  const studentId = Math.floor(100000 + Math.random() * 900000).toString();
  const email = `${studentId}@libraryapp.com`;

  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: name,
  });

  await admin.firestore().collection("users").doc(userRecord.uid).set({
    name,
    dob,
    class: className,
    studentId,
    role: "student",
    email,
  });

  return {studentId, email};
}

// HTTP endpoint to create a student user (CORS-enabled)
exports.createStudentUserHttp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).send("");
      return;
    }
    try {
      const result = await createStudent(req.body);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).send(result);
    } catch (error) {
      console.error("HTTP Error creating student:", error);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).send({error: error.message});
    }
  });
});

// Callable function to create a student user (admin only)
exports.createStudentUser = functions
  .https.onCall(async (data, context) => {
    // Verify caller is an admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Must be an admin to create users");
    }

    const {email, password, name, dob, className, studentId} = data;

    // Validate input
    if (!email || !password || !name || !dob || !className || !studentId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      // Save user data to Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        name,
        dob,
        class: className,
        studentId,
        role: "student",
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {studentId};
    } catch (error) {
      console.error("Error creating user:", error);
      throw new functions.https.HttpsError("internal", `Failed to create user: ${error.message}`);
    }
  });

// HTTP endpoint to set admin claim for a user (for setup/testing only)
exports.setAdminClaim = functions.https.onRequest(async (req, res) => {
  const uid = "xDvtVII7cAV0V5g0yzpIWf70AqB3"; // Replace with actual UID
  try {
    await admin.auth().setCustomUserClaims(uid, {admin: true});
    res.send(`Admin claim set for user ${uid}`);
  } catch (error) {
    console.error("Error setting admin claim:", error);
    res.status(500).send("Error setting admin claim");
  }
});

