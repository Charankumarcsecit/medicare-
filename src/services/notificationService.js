import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Notification Service
 * Handles sending notifications to patients and caretakers
 */

// Send browser notification
export const sendBrowserNotification = (title, body, icon = '/logo192.png') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200],
      tag: 'medication-reminder',
      requireInteraction: true
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

// Log notification to Firestore
export const logNotification = async (userId, notificationData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notificationData,
      timestamp: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
};

// Send caretaker alert (stores in Firestore, backend should handle email)
export const sendCaretakerAlert = async (userId, caretakerEmail, medicationData) => {
  try {
    const alertData = {
      userId,
      caretakerEmail,
      medicationName: medicationData.name,
      medicationDosage: medicationData.dosage,
      scheduledTime: medicationData.time,
      missedAt: new Date().toISOString(),
      alertType: 'missed_medication',
      timestamp: serverTimestamp()
    };

    // Store in Firestore (your backend can listen to this collection and send emails)
    await addDoc(collection(db, 'caretaker_alerts'), alertData);

    // Log notification
    await logNotification(userId, {
      type: 'caretaker_alert_sent',
      message: `Caretaker ${caretakerEmail} notified about missed ${medicationData.name}`,
      severity: 'high'
    });

    console.log('Caretaker alert logged:', alertData);
    return true;
  } catch (error) {
    console.error('Error sending caretaker alert:', error);
    return false;
  }
};

// Schedule reminder
export const scheduleReminder = (medication, callback) => {
  const now = new Date();
  const [time, period] = medication.time.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let scheduledHour = hours;
  if (period === 'PM' && hours !== 12) scheduledHour += 12;
  if (period === 'AM' && hours === 12) scheduledHour = 0;

  const scheduledTime = new Date();
  scheduledTime.setHours(scheduledHour, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  return setTimeout(() => {
    callback(medication);
  }, delay);
};

// Auto-reminder system (every 5 minutes for missed medications)
export const startAutoReminder = (medication, caretakerEmail, onRemind, onCaretakerAlert) => {
  let reminderCount = 0;
  const maxReminders = 6; // 30 minutes total (6 x 5 minutes)

  const interval = setInterval(() => {
    reminderCount++;

    // Send reminder notification
    if (onRemind) {
      onRemind(medication);
    }

    sendBrowserNotification(
      '💊 Medication Reminder',
      `Please take ${medication.name} ${medication.dosage}. Scheduled for ${medication.time}`,
      '/logo192.png'
    );

    // After 30 minutes (6 reminders), notify caretaker
    if (reminderCount === maxReminders && caretakerEmail) {
      if (onCaretakerAlert) {
        onCaretakerAlert(medication);
      }
      clearInterval(interval);
    }
  }, 5 * 60 * 1000); // 5 minutes

  return interval;
};

// Play notification sound
export const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

export default {
  sendBrowserNotification,
  requestNotificationPermission,
  logNotification,
  sendCaretakerAlert,
  scheduleReminder,
  startAutoReminder,
  playNotificationSound
};
