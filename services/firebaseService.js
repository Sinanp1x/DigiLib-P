const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

class FirebaseService {
  async createUser(userData) {
    try {
      // Create the user in Firebase Authentication
      const firebaseUser = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        phoneNumber: userData.phone
      });
      
      // Return Firebase UID for storing in SQLite
      return firebaseUser.uid;
    } catch (error) {
      console.error('Error creating user in Firebase:', error);
      throw error;
    }
  }

  async pushInstitutionData({ firebaseUid, institution, departments }) {
    // Generate license key
    const licenseKey = crypto.randomBytes(16).toString('hex');
    const db = admin.database();

    // Store institution/user details and license key
    await db.ref(`digi-lib/${firebaseUid}`).set({
      ...institution,
      licenseKey,
      ...(departments ? { departments } : {})
    });

    // Store license key in license-registry
    await db.ref(`digi-lib/license-registry/${institution.institutionName}`).set(licenseKey);

    return licenseKey;
  }

  async sendLicenseKeyEmail(email, licenseKey) {
    try {
      // Create transporter (configure with your email service)
      const transporter = nodemailer.createTransporter({
        service: 'gmail', // or your email service
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Your DigiLib License Key',
        html: `
          <h2>Welcome to DigiLib!</h2>
          <p>Thank you for registering your institution.</p>
          <p>Your license key is: <strong>${licenseKey}</strong></p>
          <p>Please keep this key safe. You will need it to activate your account.</p>
          <p>To activate your license, go to your profile page and enter this key.</p>
          <br>
          <p>Best regards,<br>DigiLib Team</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`License key sent to ${email}`);
    } catch (error) {
      console.error('Error sending license key email:', error);
      // In production, you might want to throw this error or handle it differently
      // For now, we'll just log it and continue
    }
  }
}

module.exports = new FirebaseService();
