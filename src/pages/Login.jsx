import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userType } = useParams();

  const getUserTypeInfo = () => {
    switch(userType) {
      case 'patient-standard':
        return {
          title: 'Patient Login (Reading & Writing)',
          subtitle: 'Sign in to manage your medications',
          color: 'from-teal-500 to-cyan-500',
          type: 'patient-standard'
        };
      case 'patient-voice':
        return {
          title: 'Patient Login (Voice Only)',
          subtitle: 'Sign in for voice-based medication management',
          color: 'from-orange-500 to-red-500',
          type: 'patient-voice'
        };
      case 'caretaker':
        return {
          title: 'Caretaker Login',
          subtitle: 'Sign in to monitor your patients',
          color: 'from-purple-500 to-pink-500',
          type: 'caretaker'
        };
      default:
        return {
          title: 'Login',
          subtitle: 'Sign in to continue',
          color: 'from-accent-orange to-accent-red',
          type: 'patient-standard'
        };
    }
  };

  const typeInfo = getUserTypeInfo();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Verify user type matches
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userType && userData.accountType !== typeInfo.type) {
          await auth.signOut();
          setError(`This account is registered as ${userData.displayType || userData.accountType}. Please use the correct login page.`);
          setLoading(false);
          return;
        }

        // Navigate based on user type
        if (userData.accountType === 'caretaker') {
          navigate('/caregiver');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
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

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="alert-danger">
                <FiAlertCircle className="inline mr-2" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="your@email.com"
                  required
                />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to={`/register/${userType || 'patient-standard'}`} className="text-accent-orange font-semibold hover:text-accent-red transition-colors">
                Sign up here
              </Link>
            </p>
            <p className="text-gray-500 mt-3">
              <Link to="/" className="hover:text-gray-300 transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-dark-card rounded-xl border border-dark-border">
            <div className="text-2xl mb-2">💊</div>
            <p className="text-xs text-gray-400">Smart Reminders</p>
          </div>
          <div className="p-4 bg-dark-card rounded-xl border border-dark-border">
            <div className="text-2xl mb-2">📸</div>
            <p className="text-xs text-gray-400">OCR Verification</p>
          </div>
          <div className="p-4 bg-dark-card rounded-xl border border-dark-border">
            <div className="text-2xl mb-2">🎤</div>
            <p className="text-xs text-gray-400">Voice Assistant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
