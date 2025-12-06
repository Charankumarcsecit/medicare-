import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Log dose status
export const logDoseStatus = async (userId, logData) => {
  try {
    const logId = `log_${Date.now()}`;
    const logRef = doc(db, 'users', userId, 'adherenceLogs', logId);

    const log = {
      ...logData,
      id: logId,
      userId,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    await setDoc(logRef, log);
    
    // Check for alerts
    await checkAndCreateAlerts(userId, logData);

    return { success: true, id: logId };
  } catch (error) {
    console.error('Error logging dose status:', error);
    return { success: false, error: error.message };
  }
};

// Check and create alerts based on adherence patterns
const checkAndCreateAlerts = async (userId, logData) => {
  try {
    // Get recent logs (last 48 hours)
    const logsRef = collection(db, 'users', userId, 'adherenceLogs');
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const q = query(
      logsRef,
      where('createdAt', '>=', twoDaysAgo),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const recentLogs = [];
    snapshot.forEach(doc => recentLogs.push(doc.data()));

    // Count missed doses in last 48 hours
    const missedCount = recentLogs.filter(log => log.status === 'missed').length;
    
    // Create alerts
    const alerts = [];

    // RISK_ALERT: More than 2 missed doses in 48 hours
    if (missedCount > 2) {
      alerts.push({
        type: 'RISK_ALERT',
        severity: 'high',
        message: `${missedCount} doses missed in the last 48 hours`,
        medicationName: logData.medicationName
      });
    }

    // EXPIRED_ALERT: Expired medication detected
    if (logData.status === 'expired') {
      alerts.push({
        type: 'EXPIRED_ALERT',
        severity: 'critical',
        message: 'Expired medication detected',
        medicationName: logData.medicationName,
        expiryDate: logData.expiryDate
      });
    }

    // WRONG_MED_ALERT: Wrong medication taken
    if (logData.status === 'wrong') {
      alerts.push({
        type: 'WRONG_MED_ALERT',
        severity: 'critical',
        message: 'Wrong medication detected',
        expectedMed: logData.expectedMedication,
        detectedMed: logData.detectedMedication
      });
    }

    // Save alerts to Firestore
    for (const alert of alerts) {
      await createAlert(userId, alert);
    }

    return alerts;
  } catch (error) {
    console.error('Error checking alerts:', error);
    return [];
  }
};

// Create an alert
export const createAlert = async (userId, alertData) => {
  try {
    const alertId = `alert_${Date.now()}`;
    const alertRef = doc(db, 'users', userId, 'alerts', alertId);

    const alert = {
      ...alertData,
      id: alertId,
      userId,
      read: false,
      createdAt: serverTimestamp()
    };

    await setDoc(alertRef, alert);

    // Also create alert for caregiver if linked
    const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      if (userData.caregiverId) {
        const caregiverAlertRef = doc(db, 'users', userData.caregiverId, 'caregiverAlerts', alertId);
        await setDoc(caregiverAlertRef, {
          ...alert,
          patientId: userId,
          patientName: userData.name || 'Patient'
        });
      }
    }

    return { success: true, id: alertId };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: error.message };
  }
};

// Get adherence logs
export const getAdherenceLogs = async (userId, days = 7) => {
  try {
    const logsRef = collection(db, 'users', userId, 'adherenceLogs');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const q = query(
      logsRef,
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));

    return { success: true, data: logs };
  } catch (error) {
    console.error('Error getting adherence logs:', error);
    return { success: false, error: error.message };
  }
};

// Get alerts
export const getAlerts = async (userId) => {
  try {
    const alertsRef = collection(db, 'users', userId, 'alerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const alerts = [];
    snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));

    return { success: true, data: alerts };
  } catch (error) {
    console.error('Error getting alerts:', error);
    return { success: false, error: error.message };
  }
};

// Mark alert as read
export const markAlertAsRead = async (userId, alertId) => {
  try {
    const alertRef = doc(db, 'users', userId, 'alerts', alertId);
    await updateDoc(alertRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return { success: false, error: error.message };
  }
};

// Calculate adherence rate
export const calculateAdherenceRate = (logs, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentLogs = logs.filter(log => {
    const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
    return logDate >= startDate;
  });

  if (recentLogs.length === 0) return 0;

  const takenCount = recentLogs.filter(log => log.status === 'taken').length;
  return Math.round((takenCount / recentLogs.length) * 100);
};

// Get adherence stats
export const getAdherenceStats = (logs) => {
  const stats = {
    total: logs.length,
    taken: logs.filter(log => log.status === 'taken').length,
    missed: logs.filter(log => log.status === 'missed').length,
    wrong: logs.filter(log => log.status === 'wrong').length,
    expired: logs.filter(log => log.status === 'expired').length
  };

  stats.adherenceRate = stats.total > 0 
    ? Math.round((stats.taken / stats.total) * 100) 
    : 0;

  return stats;
};

// Real-time listener for alerts
export const subscribeToAlerts = (userId, callback) => {
  const alertsRef = collection(db, 'users', userId, 'alerts');
  const q = query(alertsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
    callback(alerts);
  });
};

// Get caregiver alerts (for caregiver dashboard)
export const getCaregiverAlerts = async (caregiverId) => {
  try {
    const alertsRef = collection(db, 'users', caregiverId, 'caregiverAlerts');
    const q = query(alertsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const alerts = [];
    snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));

    return { success: true, data: alerts };
  } catch (error) {
    console.error('Error getting caregiver alerts:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to caregiver alerts
export const subscribeToCaregiverAlerts = (caregiverId, callback) => {
  const alertsRef = collection(db, 'users', caregiverId, 'caregiverAlerts');
  const q = query(alertsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
    callback(alerts);
  });
};

export default {
  logDoseStatus,
  createAlert,
  getAdherenceLogs,
  getAlerts,
  markAlertAsRead,
  calculateAdherenceRate,
  getAdherenceStats,
  subscribeToAlerts,
  getCaregiverAlerts,
  subscribeToCaregiverAlerts
};
