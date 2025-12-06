import React, { useState } from 'react';
import { FiClock, FiInfo, FiTrash2, FiEdit2, FiCamera, FiCheck } from 'react-icons/fi';
import { logDoseStatus } from '../services/adherenceService';
import CameraInput from './CameraInput';

const MedicineCard = ({ medication, userId, onDelete, onEdit }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleMarkAsTaken = async () => {
    try {
      await logDoseStatus(userId, {
        medicationId: medication.id,
        medicationName: medication.name,
        status: 'taken',
        dosage: medication.dosage,
        scheduledTime: new Date().toISOString()
      });
      setVerified(true);
      setTimeout(() => setVerified(false), 3000);
    } catch (error) {
      console.error('Error logging dose:', error);
    }
  };

  const handleVerificationComplete = async ({ ocrResult, verification }) => {
    setVerifying(true);

    try {
      const status = verification.isValid ? 'taken' : 
                     (verification.errors.some(e => e.includes('expired')) ? 'expired' : 'wrong');

      await logDoseStatus(userId, {
        medicationId: medication.id,
        medicationName: medication.name,
        status: status,
        dosage: medication.dosage,
        scheduledTime: new Date().toISOString(),
        ocrData: ocrResult,
        verificationData: verification,
        detectedMedication: ocrResult.medicineName,
        expectedMedication: medication.name,
        expiryDate: ocrResult.expiryDate
      });

      if (verification.isValid) {
        setVerified(true);
        setTimeout(() => {
          setVerified(false);
          setShowCamera(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error logging verification:', error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="card hover:shadow-xl hover:shadow-accent-orange/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{medication.name}</h3>
          <p className="text-gray-400 font-semibold">{medication.dosage}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(medication)}
              className="p-2 text-accent-blue hover:bg-accent-blue/20 rounded-lg transition-colors"
              title="Edit"
            >
              <FiEdit2 />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(medication.id)}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-300">
          <FiClock className="mr-2 text-accent-purple" />
          <span className="font-medium">{medication.frequency}</span>
        </div>

        {medication.times && medication.times.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">Schedule:</p>
            <div className="flex flex-wrap gap-2">
              {medication.times.map((time, index) => (
                <span key={index} className="badge bg-accent-blue/20 text-accent-blue border border-accent-blue/30">
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}

        {medication.instructions && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-lg">
            <p className="text-sm flex items-start">
              <FiInfo className="mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300">{medication.instructions}</span>
            </p>
          </div>
        )}
      </div>

      {verified && (
        <div className="alert-success mb-4">
          <FiCheck className="inline mr-2" />
          Dose logged successfully!
        </div>
      )}

      {!showCamera ? (
        <div className="flex gap-2">
          <button
            onClick={handleMarkAsTaken}
            className="btn-primary flex-1"
            disabled={verified}
          >
            <FiCheck className="inline mr-2" />
            Mark as Taken
          </button>
          <button
            onClick={() => setShowCamera(true)}
            className="btn-secondary flex-1"
          >
            <FiCamera className="inline mr-2" />
            Verify with Camera
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <CameraInput
            prescription={medication}
            onVerificationComplete={handleVerificationComplete}
          />
          <button
            onClick={() => setShowCamera(false)}
            className="btn-secondary w-full mt-3"
          >
            Cancel Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineCard;
