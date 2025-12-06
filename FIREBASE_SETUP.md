# Firebase Configuration Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "smart-medication-assistant"
4. Enable/disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Register Web App

1. In Firebase Console, click the Web icon (</>)
2. Register app with nickname: "Smart Medication Assistant Web"
3. Copy the Firebase configuration object
4. Paste it into `src/services/firebase.js`

## Step 3: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Save

## Step 4: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode" (we'll set rules next)
4. Select a location close to your users
5. Click "Enable"

## Step 5: Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to subcollections
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Caregivers can read patient data if linked
    match /users/{userId}/medications/{medId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(userId)).data.caregiverId == request.auth.uid);
    }
  }
}
```

## Step 6: Create Firestore Indexes

Go to Firestore > Indexes and create these composite indexes:

1. **Collection**: `users/{userId}/medications`
   - Fields: `active` (Ascending), `createdAt` (Descending)

2. **Collection**: `users/{userId}/adherenceLogs`
   - Fields: `createdAt` (Ascending)

3. **Collection**: `users/{userId}/alerts`
   - Fields: `createdAt` (Descending)

## Step 7: Enable Cloud Messaging (Optional)

1. Go to "Cloud Messaging" in Firebase Console
2. Click "Get Started"
3. Generate VAPID key
4. Add VAPID key to `src/services/firebase.js`:
   ```javascript
   vapidKey: 'YOUR_VAPID_KEY_HERE'
   ```

## Step 8: Test Configuration

1. Run the app: `npm start`
2. Try to register a new user
3. Check Firebase Console > Authentication to see the user
4. Add a medication
5. Check Firestore to see the data

## Firestore Data Structure

```
users/
  {userId}/
    - name: string
    - email: string
    - userType: "patient" | "caregiver"
    - caregiverId: string (optional)
    - patientIds: array (optional)
    - createdAt: timestamp
    
    medications/
      {medicationId}/
        - name: string
        - dosage: string
        - frequency: string
        - times: array
        - instructions: string
        - startDate: string
        - endDate: string
        - active: boolean
        - createdAt: timestamp
    
    adherenceLogs/
      {logId}/
        - medicationId: string
        - medicationName: string
        - status: "taken" | "missed" | "wrong" | "expired"
        - scheduledTime: string
        - timestamp: timestamp
        - ocrData: object (optional)
    
    alerts/
      {alertId}/
        - type: "RISK_ALERT" | "EXPIRED_ALERT" | "WRONG_MED_ALERT"
        - severity: "critical" | "high" | "medium"
        - message: string
        - medicationName: string
        - read: boolean
        - createdAt: timestamp
    
    caregiverAlerts/
      {alertId}/
        - (same as alerts plus)
        - patientId: string
        - patientName: string
```

## Environment Variables (Optional)

Create `.env` file in root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Then update `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## Troubleshooting

**Error**: "Firebase: Error (auth/configuration-not-found)"
- Solution: Double-check your Firebase config values

**Error**: "Missing or insufficient permissions"
- Solution: Update Firestore security rules

**Error**: "Quota exceeded"
- Solution: Upgrade Firebase plan or optimize queries

## Production Deployment

1. Go to Firebase Console > Hosting
2. Click "Get Started"
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Run: `firebase login`
5. Run: `firebase init hosting`
6. Build app: `npm run build`
7. Deploy: `firebase deploy`

Your app will be available at: `https://your-project-id.web.app`
