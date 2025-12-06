import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const Register = () => {
  const { userType } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getUserTypeInfo = () => {
    switch(userType) {
      case 'patient-standard':
        return {
          title: 'Create Patient Account (Reading & Writing)',
          subtitle: 'Sign up to manage your medications',
          color: 'from-teal-500 to-cyan-500',
          type: 'patient-standard',
          displayName: 'Patient (Standard)'
        };
      case 'patient-voice':
        return {
          title: 'Create Patient Account (Voice Only)',
          subtitle: 'Sign up for voice-based medication management',
          color: 'from-orange-500 to-red-500',
          type: 'patient-voice',
          displayName: 'Patient (Voice)'
        };
      case 'caretaker':
        return {
          title: 'Create Caretaker Account',
          subtitle: 'Sign up to monitor patients',
          color: 'from-purple-500 to-pink-500',
          type: 'caretaker',
          displayName: 'Caretaker'
        };
      default:
        return {
          title: 'Create Account',
          subtitle: 'Sign up to get started',
          color: 'from-accent-orange to-accent-red',
          type: 'patient-standard',
          displayName: 'Patient (Standard)'
        };
    }
  };

  const typeInfo = getUserTypeInfo();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        accountType: typeInfo.type,
        displayType: typeInfo.displayName,
        createdAt: serverTimestamp(),
        caregiverId: null,
        patientIds: []
      });

      // Navigate based on account type
      if (typeInfo.type === 'caretaker') {
        navigate('/caregiver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${typeInfo.color} rounded-3xl shadow-lg shadow-accent-orange/20 mb-4 transform hover:scale-105 transition-transform`}>
            <FaPills className="text-white text-4xl" />
          </div>
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${typeInfo.color} bg-clip-text text-transparent`}>
            {typeInfo.title}
          </h1>
          <p className="text-gray-400 mt-2">{typeInfo.subtitle}</p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="alert-danger">
                <FiAlertCircle className="inline mr-2" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Account Type
              </label>
              <div className={`py-3 px-4 rounded-xl border-2 bg-gradient-to-r ${typeInfo.color} bg-opacity-10 border-opacity-30`}>
                <p className="text-white font-semibold text-center">{typeInfo.displayName}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to={`/login/${userType || 'patient-standard'}`} className="text-accent-orange font-semibold hover:text-accent-red transition-colors">
                Sign in here
              </Link>
            </p>
            <p className="text-gray-500 mt-3">
              <Link to="/" className="hover:text-gray-300 transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
