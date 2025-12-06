import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiMic, FiHeart } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      icon: <FiBook className="w-12 h-12" />,
      title: 'Patient: Reading & Writing',
      description: 'View medication cards, set your schedule and track your medications with text input.',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      path: '/login/patient-standard'
    },
    {
      icon: <FiMic className="w-12 h-12" />,
      title: 'Patient: Speaking Only',
      description: 'Use individual interface - just speak to manage your medications.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      path: '/login/patient-voice'
    },
    {
      icon: <FiHeart className="w-12 h-12" />,
      title: 'Care Taker',
      description: 'Monitor patient assistance track progress and manage emergency contacts.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      path: '/login/caretaker'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">MediCare Assistant</h1>
              <p className="text-xs text-gray-500">Smart medication management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl shadow-lg shadow-teal-500/30 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 mb-4">
              🏥 AI-POWERED HEALTH ASSISTANT 🏥
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Welcome to <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">MediCare</span>
          </h1>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your personal medical assistant. Choose your role below to get started with medication management.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {userTypes.map((type, index) => (
            <div
              key={index}
              onClick={() => navigate(type.path)}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-gray-200 hover:scale-105"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {type.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {type.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {type.description}
              </p>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Need Help Getting Started?
              </h3>
              <p className="text-gray-700 mb-4">
                If you have trouble reading, don't know "Speaking Only" mode. The app will read text out loud and respond to your voice commands.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/login/patient-standard')}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/30"
                >
                  📱 Login button for new sign-up
                </button>
                <button className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200">
                  📞 Voice service available
                </button>
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                  ⚡ Medication reminders
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p className="mb-2">MediCare Assistant • Designed for Elderly Users</p>
          <p>Always consult your doctor for medical advice</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
