import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// CRUD Operations for Medications

// Create a new medication
export const addMedication = async (userId, medicationData) => {
  try {
    const medId = `med_${Date.now()}`;
    const medRef = doc(db, 'users', userId, 'medications', medId);
    
    const medication = {
      ...medicationData,
      id: medId,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true
    };

    await setDoc(medRef, medication);
    return { success: true, id: medId, data: medication };
  } catch (error) {
    console.error('Error adding medication:', error);
    return { success: false, error: error.message };
  }
};

// Get all medications for a user
export const getMedications = async (userId) => {
  try {
    const medsRef = collection(db, 'users', userId, 'medications');
    const q = query(medsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const medications = [];
    
    snapshot.forEach((doc) => {
      medications.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: medications };
  } catch (error) {
    console.error('Error getting medications:', error);
    return { success: false, error: error.message };
  }
};

// Get a single medication
export const getMedication = async (userId, medId) => {
  try {
    const medRef = doc(db, 'users', userId, 'medications', medId);
    const medSnap = await getDoc(medRef);

    if (medSnap.exists()) {
      return { success: true, data: { id: medSnap.id, ...medSnap.data() } };
    } else {
      return { success: false, error: 'Medication not found' };
    }
  } catch (error) {
    console.error('Error getting medication:', error);
    return { success: false, error: error.message };
  }
};

// Update medication
export const updateMedication = async (userId, medId, updates) => {
  try {
    const medRef = doc(db, 'users', userId, 'medications', medId);
    await updateDoc(medRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating medication:', error);
    return { success: false, error: error.message };
  }
};

// Delete medication (soft delete)
export const deleteMedication = async (userId, medId) => {
  try {
    const medRef = doc(db, 'users', userId, 'medications', medId);
    await updateDoc(medRef, {
      active: false,
      deletedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting medication:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for medications
export const subscribeToMedications = (userId, callback) => {
  const medsRef = collection(db, 'users', userId, 'medications');
  const q = query(medsRef, where('active', '==', true), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const medications = [];
    snapshot.forEach((doc) => {
      medications.push({ id: doc.id, ...doc.data() });
    });
    callback(medications);
  });
};

// Get medications due now
export const getMedicationsDueNow = (medications) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  return medications.filter(med => {
    if (!med.times || !Array.isArray(med.times)) return false;
    
    return med.times.some(time => {
      const [hour, minute] = time.split(':');
      const medTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      // Check if within 15 minutes window
      const medMinutes = parseInt(hour) * 60 + parseInt(minute);
      const nowMinutes = currentHour * 60 + currentMinute;
      const diff = Math.abs(medMinutes - nowMinutes);
      
      return diff <= 15;
    });
  });
};

// Get next medication
export const getNextMedication = (medications) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextMed = null;
  let minDiff = Infinity;

  medications.forEach(med => {
    if (!med.times || !Array.isArray(med.times)) return;

    med.times.forEach(time => {
      const [hour, minute] = time.split(':');
      const medMinutes = parseInt(hour) * 60 + parseInt(minute);
      
      let diff = medMinutes - currentMinutes;
      if (diff < 0) diff += 24 * 60; // Next day

      if (diff < minDiff) {
        minDiff = diff;
        nextMed = { ...med, nextTime: time };
      }
    });
  });

  return nextMed;
};

export default {
  addMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication,
  subscribeToMedications,
  getMedicationsDueNow,
  getNextMedication
};
