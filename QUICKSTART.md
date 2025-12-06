# 🚀 Quick Start Guide

Get your Smart Medication Assistant running in 5 minutes!

## ✅ Prerequisites Checklist

- [ ] Node.js installed (v14+) - [Download](https://nodejs.org/)
- [ ] Firebase account - [Create Free Account](https://firebase.google.com/)
- [ ] Modern browser (Chrome, Edge, or Safari recommended)

## 📋 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd smart-medication-assistant
npm install
```

Wait for all packages to install...

### Step 2: Firebase Setup (2 minutes)

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Name it "medication-assistant"
   - Click through the wizard

2. **Get Firebase Config**:
   - Click the Web icon (</>)
   - Register app
   - Copy the `firebaseConfig` object

3. **Add Config to App**:
   - Open `src/services/firebase.js`
   - Replace lines 6-13 with your config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Enable Services**:
   - In Firebase Console → Authentication → Enable "Email/Password"
   - In Firebase Console → Firestore Database → Create Database
   - Choose "Production mode" → Select closest location → Enable

### Step 3: Start the App (1 minute)

```bash
npm start
```

Your browser will automatically open to `http://localhost:3000`

## 🎉 First Use

1. **Register Account**:
   - Click "Sign up here"
   - Enter name, email, password
   - Choose "Patient"
   - Click "Create Account"

2. **Add Your First Medicine**:
   - Click "Add Medicine"
   - Fill in: Name, Dosage, Times
   - Click "Add Medicine"

3. **Try Voice Assistant**:
   - Click the microphone button
   - Say: "What medicine should I take now?"
   - Listen to the response!

4. **Test Camera Verification**:
   - Click "Verify with Camera" on any medicine
   - Allow camera access
   - Point at medicine packaging
   - Click "Capture"

## 🔧 Firestore Security Rules

⚠️ **IMPORTANT**: Set these rules for security

1. Go to Firestore → Rules
2. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## ✨ You're All Set!

Your Smart Medication Assistant is now running!

### What You Can Do Now:

✅ Add medications with schedules  
✅ Get voice-based medication info  
✅ Verify medicines with camera  
✅ Track adherence automatically  
✅ Monitor with caregiver dashboard  

## 🆘 Quick Troubleshooting

**App won't start?**
```bash
npm install
npm start
```

**Firebase errors?**
- Double-check firebaseConfig in `src/services/firebase.js`
- Ensure Authentication is enabled
- Ensure Firestore is created

**Camera not working?**
- Click address bar → Allow camera
- Use HTTPS in production
- Try Chrome/Edge browser

**Voice not working?**
- Use Chrome, Edge, or Safari
- Allow microphone access
- Not supported in Firefox

## 📚 Next Steps

1. Read [USER_GUIDE.md](./USER_GUIDE.md) for detailed features
2. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for advanced config
3. Review [README.md](./README.md) for technical details

## 🎯 Pro Tips

- Use Chrome for best compatibility
- Allow notifications for reminders
- Test OCR with clear, well-lit photos
- Set medication times you'll actually be available
- Try voice commands for hands-free use

## 📱 Production Deployment

Ready to deploy? Run:

```bash
npm run build
firebase deploy
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for deployment details.

---

## 🌟 Enjoy Your Smart Medication Assistant!

Need help? Check the documentation files or Firebase Console logs.

**Version**: 1.0.0 MVP  
**Built with**: React.js ❤️ Firebase  
