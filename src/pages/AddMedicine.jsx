import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { addMedication } from '../services/medicationService';
import MedicineForm from '../components/MedicineForm';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const AddMedicine = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      const result = await addMedication(user.uid, formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        alert('Failed to add medication: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <FaPills className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Add New Medication
            </h1>
          </div>
          <p className="text-gray-600">Enter your medication details to set up reminders and tracking</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert-success mb-6 animate-bounce">
            <FiCheckCircle className="inline mr-2" />
            Medication added successfully! Redirecting to dashboard...
          </div>
        )}

        {/* Form */}
        <div className="card">
          <MedicineForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>

        {/* Info Box */}
        <div className="card bg-blue-50 border-2 border-blue-200 mt-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Tips for Better Medication Management
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Set reminders at times when you're usually at home or have easy access to your medicine</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Use the camera verification feature to ensure you're taking the correct medication</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Add detailed instructions like "Take with food" or "Avoid alcohol" to help you remember important details</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Voice assistant can help you check your schedule hands-free</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
