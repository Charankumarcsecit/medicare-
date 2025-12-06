# Smart Medication Assistant - User Guide

## 📖 Complete Feature Guide

### 🔐 Getting Started

#### 1. Registration
1. Open the application
2. Click "Sign up here"
3. Enter your full name
4. Enter email address
5. Choose user type:
   - **Patient**: If you need medication management
   - **Caregiver**: If you're monitoring someone else
6. Create a password (minimum 6 characters)
7. Confirm password
8. Click "Create Account"

#### 2. Login
1. Enter your email
2. Enter your password
3. Click "Sign In"
4. You'll be redirected to your dashboard

---

## 👤 For Patients

### Adding Your First Medication

1. **From Dashboard**:
   - Click the "Add Medicine" button
   
2. **Fill in Medication Details**:
   - **Medicine Name**: e.g., "Aspirin", "Metformin"
   - **Dosage**: e.g., "500mg", "10ml"
   - **Frequency**: Choose from dropdown
     - Daily
     - Twice Daily
     - Thrice Daily
     - Weekly
     - As Needed
   
3. **Set Time Slots**:
   - Click "Add Time" for multiple doses per day
   - Use the time picker to set exact times
   - Example: 08:00 AM, 02:00 PM, 08:00 PM
   
4. **Optional Information**:
   - **Start Date**: When to begin this medication
   - **End Date**: When to stop (leave empty for ongoing)
   - **Instructions**: e.g., "Take with food", "Avoid alcohol"
   
5. **Save**:
   - Click "Add Medicine"
   - You'll see a success message
   - Automatic redirect to dashboard

### Taking Your Medication

#### Method 1: Quick Mark as Taken
1. Find the medication card on your dashboard
2. Click "Mark as Taken"
3. ✅ Dose is logged automatically

#### Method 2: Camera Verification (Recommended)
1. Click "Verify with Camera"
2. Allow camera access when prompted
3. Point camera at medicine packaging
4. Ensure text is clear and readable
5. Click "Capture"
6. Wait for OCR processing (3-5 seconds)
7. Review extracted information:
   - Medicine name
   - Dosage
   - Expiry date
   - Batch number
8. System automatically verifies:
   - ✅ **Correct medicine**: Green success message
   - ❌ **Wrong medicine**: Red error alert
   - ⚠️ **Expired**: Critical warning
9. Dose logged with verification status

### Using the Voice Assistant

#### Activating Voice Commands
1. Find the "Voice Assistant" card
2. Click the microphone button (turns red when listening)
3. Speak your question clearly
4. Wait for response (text + audio)

#### Supported Commands

**Check Current Medications**:
- "What medicine should I take now?"
- "Do I need to take anything right now?"

**Next Dose Information**:
- "When is my next dose?"
- "What's my next medication?"

**Medication History**:
- "Did I take my morning dose?"
- "Have I taken my medicine today?"

**Prescription Details**:
- "Explain my prescription"
- "Tell me about my medications"

**List All Medicines**:
- "List my medicines"
- "What medications am I on?"

**Help**:
- "Help"
- "What can you do?"

#### Tips for Better Voice Recognition
- Speak clearly and at normal pace
- Reduce background noise
- Wait for the microphone to activate (red)
- Use natural language
- Works best in Chrome, Edge, Safari

### Understanding Your Dashboard

#### Stats Overview (Top Cards)
- **Total Medications**: Number of active prescriptions
- **Adherence Rate**: Percentage of doses taken on time (last 7 days)
- **Due Now**: Medications you need to take right now (±15 min window)
- **Active Alerts**: Critical notifications needing attention

#### Alerts Section
Shows important notifications:
- 🔴 **CRITICAL**: Expired medicine, wrong medicine detected
- 🟠 **HIGH**: Multiple missed doses (>2 in 48 hours)
- 🔵 **INFO**: General reminders

#### Medications Due Now
- Highlighted with animation
- Shows during the scheduled time window (±15 minutes)
- Quick action buttons available

#### Next Medication
- Displays when no doses are currently due
- Shows name and scheduled time
- Helps you plan ahead

#### All Medications List
- Complete list of your prescriptions
- Each card shows:
  - Medicine name and dosage
  - Frequency and schedule
  - Special instructions
  - Action buttons (Mark as Taken, Verify)

#### 7-Day Overview
- Quick stats for the past week
- Color-coded badges:
  - 🟢 Green: Taken
  - 🔴 Red: Missed
  - 🟡 Yellow: Wrong medicine
  - 🔴 Red: Expired

---

## 👨‍⚕️ For Caregivers

### Accessing Caregiver Dashboard

1. Register with "Caregiver" user type
2. Navigate to `/caregiver` route
3. View real-time patient monitoring

### Dashboard Features

#### Stats Overview
- **Patients**: Number of patients you're monitoring
- **Critical Alerts**: Immediate attention needed
- **Missed Doses**: Total missed across all patients
- **Total Alerts**: All active notifications

#### Weekly Adherence Chart
- Bar graph showing doses taken vs missed
- 7-day trend analysis
- Color-coded (Green = Taken, Red = Missed)
- Helps identify patterns

#### Alert Filtering
Click buttons to filter by type:
- **All Alerts**: Complete view
- **Missed Doses**: RISK_ALERT notifications
- **Expired**: EXPIRED_ALERT warnings
- **Wrong Medicine**: WRONG_MED_ALERT errors

#### Patient Alert Cards
Each patient has a dedicated card showing:
- Patient name
- Number of alerts
- Alert details with timestamps
- Severity indicators

#### Alert Types

**RISK_ALERT** (Orange):
- Triggered when patient misses >2 doses in 48 hours
- Indicates potential adherence issues
- Action: Contact patient

**EXPIRED_ALERT** (Red):
- Medicine past expiry date detected
- Critical safety concern
- Action: Advise patient to replace medication

**WRONG_MED_ALERT** (Red):
- OCR detected different medicine than scheduled
- Potential medication error
- Action: Immediate intervention required

#### Real-Time Updates
- Dashboard updates automatically
- No page refresh needed
- Live Firestore listeners
- Instant alert notifications

---

## 🎯 Best Practices

### For Accurate OCR Scanning

1. **Lighting**: Use good, even lighting
2. **Stability**: Hold camera steady
3. **Focus**: Ensure text is clear and sharp
4. **Angle**: Point camera perpendicular to packaging
5. **Distance**: 6-12 inches from package
6. **Clean Surface**: Remove any obstructions
7. **Flat Surface**: Place package on flat surface if possible

### For Medication Adherence

1. **Consistent Times**: Set times you'll reliably be available
2. **Daily Routine**: Link to daily activities (breakfast, bedtime)
3. **Enable Notifications**: Allow browser notifications
4. **Voice Reminders**: Use voice assistant for hands-free checks
5. **Camera Verification**: Verify important medications
6. **Regular Review**: Check adherence stats weekly

### Privacy & Security

1. **Strong Password**: Use unique, complex password
2. **Logout**: Always logout on shared devices
3. **Secure Connection**: Use HTTPS only
4. **Caregiver Linking**: Only share with trusted caregivers
5. **Data Privacy**: Your data is encrypted and private

---

## 🔔 Notification System

### How Reminders Work

1. **Browser Check**: App checks every minute for due medications
2. **Time Window**: ±15 minutes from scheduled time
3. **Visual Alert**: "Medications Due Now" section appears
4. **Animation**: Cards pulse to draw attention
5. **Voice Option**: Ask voice assistant anytime

### Enabling Browser Notifications (Optional)

1. Click "Allow" when prompted
2. Browser will show native notifications
3. Works even when app is in background
4. Can be configured in browser settings

---

## 🛠 Troubleshooting

### Camera Not Working

**Issue**: Camera access denied
- **Fix**: 
  1. Click browser address bar
  2. Find camera icon
  3. Allow camera access
  4. Refresh page

**Issue**: Poor image quality
- **Fix**: 
  1. Clean camera lens
  2. Improve lighting
  3. Try different angle
  4. Get closer to text

### Voice Assistant Not Responding

**Issue**: Microphone not working
- **Fix**:
  1. Check microphone permissions
  2. Use supported browser (Chrome/Edge/Safari)
  3. Ensure microphone is connected
  4. Check system microphone settings

**Issue**: Commands not understood
- **Fix**:
  1. Speak more clearly
  2. Reduce background noise
  3. Use suggested phrases
  4. Try rephrasing

### Login Issues

**Issue**: Can't login
- **Fix**:
  1. Check email spelling
  2. Verify password (case-sensitive)
  3. Clear browser cache
  4. Try password reset (if implemented)

**Issue**: Account not found
- **Fix**:
  1. Register first if new user
  2. Check email address
  3. Verify Firebase configuration

### Data Not Syncing

**Issue**: Medications not appearing
- **Fix**:
  1. Check internet connection
  2. Refresh page
  3. Logout and login again
  4. Check browser console for errors

---

## 📱 Mobile Usage

### Mobile Browser Tips

1. **Add to Home Screen**: For app-like experience
2. **Portrait Mode**: Optimized for vertical view
3. **Touch Gestures**: Swipe and tap supported
4. **Voice Commands**: Great for hands-free mobile use
5. **Camera Access**: Works better with rear camera

### Responsive Features

- ✅ Touch-optimized buttons
- ✅ Scrollable cards
- ✅ Collapsible sections
- ✅ Mobile-friendly forms
- ✅ Adaptive layouts

---

## 💡 Pro Tips

1. **Voice Assistant on-the-go**: Use voice commands while cooking or busy
2. **Camera Verification for New Prescriptions**: Always verify new medicines
3. **Check Adherence Weekly**: Review your 7-day stats regularly
4. **Set Realistic Times**: Choose times you'll actually be available
5. **Use Instructions Field**: Add important notes like "with food"
6. **Caregiver Linking**: Connect family members for extra support
7. **Medication Review**: Update or remove completed medications
8. **Time Zones**: App uses your local time automatically

---

## 🎨 Understanding Visual Indicators

### Badges
- 🟢 **Green**: Success, taken, normal
- 🔴 **Red**: Error, missed, critical
- 🟡 **Yellow**: Warning, caution needed
- 🔵 **Blue**: Information, scheduled

### Alert Borders
- **Thick left border**: Indicates severity
- **Red border**: Critical immediate action
- **Orange border**: High priority
- **Blue border**: Informational

### Animations
- **Pulse**: Due now, needs attention
- **Bounce**: Success message
- **Spin**: Loading/processing

---

## ❓ FAQ

**Q: Can I use this offline?**
A: No, requires internet for Firebase sync. Offline mode coming soon.

**Q: How accurate is the OCR?**
A: 85-95% accuracy with clear images. Verify important medications manually.

**Q: Can I link multiple caregivers?**
A: Currently one caregiver per patient. Multi-caregiver support planned.

**Q: Is my data private?**
A: Yes, all data is encrypted and accessible only to you and linked caregivers.

**Q: Can I export my medication history?**
A: Export feature coming in future update.

**Q: Does it work on all browsers?**
A: Best on Chrome, Edge, Safari. Limited on Firefox (no voice).

**Q: Can I set custom alert times?**
A: Currently uses ±15 minute window. Custom windows planned.

**Q: How do I delete a medication?**
A: Edit feature coming soon. Currently soft-deleted from backend.

---

## 📞 Need Help?

- Check FIREBASE_SETUP.md for configuration issues
- Review README.md for technical details
- Check browser console for error messages
- Ensure all Firebase services are enabled

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: December 2025  
**Support**: Check documentation files
