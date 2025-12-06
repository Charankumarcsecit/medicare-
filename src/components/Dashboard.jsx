import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getMedications, subscribeToMedications, getMedicationsDueNow, getNextMedication } from '../services/medicationService';
import { getAlerts, subscribeToAlerts, getAdherenceLogs, getAdherenceStats } from '../services/adherenceService';
import Sidebar from '../components/Sidebar';
import { FiPlusCircle, FiClock, FiMapPin, FiPhone, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [medications, setMedications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMeds, setCurrentMeds] = useState([]);
  const [nextMed, setNextMed] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const navigate = useNavigate();

  // Mock data for demonstration
  const todayMedications = [
    {
      id: 1,
      name: 'Metformin',
      dosage: '500mg',
      timing: 'Morning - After Breakfast',
      time: '8:00 AM',
      status: 'taken',
      instructions: 'Take with food or directly after a meal',
      sideEffects: 'May cause nausea initially, Ensure blood sugar regularly'
    },
    {
      id: 2,
      name: 'Lisinopril',
      dosage: '10mg',
      timing: 'Morning - Before Breakfast',
      time: '7:00 AM',
      status: 'pending',
      instructions: 'May cause dizziness, Avoid potassium supplements',
      nextReminder: '7:00 AM Tomorrow'
    },
    {
      id: 3,
      name: 'Atorvastatin',
      dosage: '20mg',
      timing: 'Night - Before Sleep',
      time: '9:30 PM',
      status: 'pending',
      instructions: 'Report muscle pain immediately, Ensure blood sugar regularly'
    },
    {
      id: 4,
      name: 'Aspirin',
      dosage: '81mg',
      timing: 'Morning - With Breakfast Diet',
      time: '8:00 AM',
      status: 'missed',
      instructions: 'Take the same time each day'
    }
  ];

  const todaySchedule = [
    { name: 'Metformin', time: 'Morning - Before Breakfast', status: 'completed' },
    { name: 'Lisinopril', time: 'Morning - Before Breakfast', status: 'pending' },
    { name: 'Atorvastatin', time: 'Night - Before Sleep', status: 'pending' }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadData(currentUser.uid);
        setupListeners(currentUser.uid);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    try {
      // Load medications
      const medsResult = await getMedications(userId);
      if (medsResult.success) {
        setMedications(medsResult.data);
        updateCurrentMeds(medsResult.data);
      }

      // Load alerts
      const alertsResult = await getAlerts(userId);
      if (alertsResult.success) {
        setAlerts(alertsResult.data.filter(a => !a.read).slice(0, 5));
      }

      // Load adherence stats
      const logsResult = await getAdherenceLogs(userId, 7);
      if (logsResult.success) {
        const stats = getAdherenceStats(logsResult.data);
        setAdherenceStats(stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupListeners = (userId) => {
    // Real-time medications listener
    const unsubMeds = subscribeToMedications(userId, (meds) => {
      setMedications(meds);
      updateCurrentMeds(meds);
    });

    // Real-time alerts listener
    const unsubAlerts = subscribeToAlerts(userId, (alertsData) => {
      setAlerts(alertsData.filter(a => !a.read).slice(0, 5));
    });

    return () => {
      unsubMeds();
      unsubAlerts();
    };
  };

  const updateCurrentMeds = (meds) => {
    const due = getMedicationsDueNow(meds);
    setCurrentMeds(due);
    
    const next = getNextMedication(meds);
    setNextMed(next);
  };

  // Set up interval to check for due medications
  useEffect(() => {
    const interval = setInterval(() => {
      if (medications.length > 0) {
        updateCurrentMeds(medications);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [medications]);

  // Fetch nearby medical facilities
  const fetchNearbyPlaces = async (lat, lng) => {
    const places = [
      {
        name: 'City Medical Center',
        address: '123 Health Street, Medical District',
        distance: '0.8 km away',
        type: 'Hospital',
        status: 'Open'
      },
      {
        name: 'Family Care Clinic',
        address: '456 Wellness Ave, Downtown',
        distance: '1.2 km away',
        type: 'Clinic',
        status: 'Closed'
      },
      {
        name: 'HealthPlus Pharmacy',
        address: '789 Medicine Road, East Side',
        distance: '0.5 km away',
        type: 'Pharmacy',
        status: 'Open'
      }
    ];
    setNearbyPlaces(places);
  };

  const handleMarkAsTaken = (medId) => {
    console.log('Marked as taken:', medId);
  };

  const handleTakeNow = (medId) => {
    console.log('Take now:', medId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-orange mb-4"></div>
          <p className="text-gray-300 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="flex h-screen">
          {/* AI Assistant Sidebar (Left) */}
          <div className="w-80 bg-dark-card border-r border-gray-700 flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">AI Assistant</h2>
                  <p className="text-gray-400 text-sm">Medical Helper</p>
                </div>
              </div>
              <div className="bg-dark-bg rounded-xl p-4 border border-gray-700">
                <p className="text-gray-300 text-sm leading-relaxed">
                  👋 Hello, it's your medical assistant. How can I help you with your medications today?
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-dark-bg hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                      <FiClock className="text-accent-blue" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Set Reminder</p>
                      <p className="text-gray-400 text-xs">Schedule medication alert</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 bg-dark-bg hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                      <FiInfo className="text-accent-green" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Drug Information</p>
                      <p className="text-gray-400 text-xs">Learn about medications</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 bg-dark-bg hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                      <FiAlertCircle className="text-accent-purple" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Side Effects</p>
                      <p className="text-gray-400 text-xs">Check medication effects</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="w-full text-left p-4 bg-dark-bg hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center">
                      <FiMapPin className="text-accent-orange" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Nearby Facilities</p>
                      <p className="text-gray-400 text-xs">Find medical centers</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <Link to="/add-medicine" className="btn-primary w-full flex items-center justify-center space-x-2">
                <FiPlusCircle />
                <span>Add Medicine</span>
              </Link>
            </div>
          </div>

          {/* Main Dashboard Area (Right) */}
          <div className="flex-1 overflow-y-auto">
            {!showMap ? (
              <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                  </h1>
                  <p className="text-gray-400">Here's your medication overview for today</p>
                </div>

                {/* Next Reminder */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-accent-orange/20 to-accent-red/20 border border-accent-orange/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-accent-orange/30 rounded-xl flex items-center justify-center">
                          <FiClock className="text-2xl text-accent-orange" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Next Reminder</p>
                          <p className="text-2xl font-bold text-white">7:00 AM Tomorrow</p>
                          <p className="text-accent-orange font-semibold">Lisinopril 10mg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-4 py-2 bg-accent-orange/20 text-accent-orange rounded-lg font-semibold text-sm">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missed Medication Alert */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-red-500/30 rounded-xl flex items-center justify-center">
                        <FiAlertCircle className="text-2xl text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Missed Medication</p>
                        <p className="text-xl font-bold text-white">Aspirin 81mg</p>
                        <p className="text-red-400 text-sm">You missed this dose yesterday at 8:00 PM</p>
                      </div>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold text-sm transition-colors">
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Today's Medications Grid */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Today's Medications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {todayMedications.map((med) => (
                      <div
                        key={med.id}
                        className={`rounded-2xl p-6 border ${
                          med.status === 'taken'
                            ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-teal-500/30'
                            : med.status === 'pending'
                            ? 'bg-gradient-to-br from-accent-orange/20 to-accent-red/20 border-accent-orange/30'
                            : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{med.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{med.dosage}</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                                med.status === 'taken'
                                  ? 'bg-teal-500/20 text-teal-400'
                                  : med.status === 'pending'
                                  ? 'bg-accent-orange/20 text-accent-orange'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {med.status.toUpperCase()}
                            </span>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              med.status === 'taken'
                                ? 'bg-teal-500/30'
                                : med.status === 'pending'
                                ? 'bg-accent-orange/30'
                                : 'bg-red-500/30'
                            }`}
                          >
                            <svg className={`w-6 h-6 ${
                              med.status === 'taken' ? 'text-teal-400' : med.status === 'pending' ? 'text-accent-orange' : 'text-red-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <FiClock className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                            <p className="text-gray-300 text-sm">{med.timing}</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <FiInfo className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                            <p className="text-gray-300 text-sm">{med.instructions}</p>
                          </div>
                        </div>

                        {med.status !== 'taken' && (
                          <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-3">
                            <button
                              onClick={() => handleMarkAsTaken(med.id)}
                              className="flex-1 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg font-semibold text-sm transition-colors"
                            >
                              Mark as Taken
                            </button>
                            <button
                              onClick={() => handleTakeNow(med.id)}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold text-sm transition-colors"
                            >
                              Take Now
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Today's Schedule</h2>
                  <div className="bg-dark-card rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="divide-y divide-gray-700">
                      {todaySchedule.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 text-center">
                              <p className="text-2xl font-bold text-white">{item.time.split(':')[0]}</p>
                              <p className="text-sm text-gray-400">{item.time.split(' ')[1]}</p>
                            </div>
                            <div className="w-px h-12 bg-gray-700"></div>
                            <div className="flex-1">
                              <p className="text-white font-semibold mb-1">{item.medication}</p>
                              <p className="text-gray-400 text-sm">{item.dosage}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                item.status === 'completed'
                                  ? 'bg-teal-500/20 text-teal-400'
                                  : item.status === 'upcoming'
                                  ? 'bg-accent-blue/20 text-accent-blue'
                                  : 'bg-accent-orange/20 text-accent-orange'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Map View */
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-white">Nearby Medical Facilities</h1>
                  <button
                    onClick={() => setShowMap(false)}
                    className="px-4 py-2 bg-dark-card hover:bg-gray-700 text-gray-300 rounded-lg font-semibold transition-colors border border-gray-700"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {/* Map Placeholder */}
                <div className="bg-dark-card rounded-2xl border border-gray-700 overflow-hidden mb-6">
                  <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <FiMapPin className="text-6xl text-accent-orange mb-4 mx-auto" />
                      <p className="text-gray-400 text-lg">Map integration with Google Maps API</p>
                      <p className="text-gray-500 text-sm mt-2">Showing facilities within 5km radius</p>
                    </div>
                  </div>
                </div>

                {/* Nearby Places List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nearbyPlaces.map((place) => (
                    <div key={place.id} className="bg-dark-card rounded-2xl border border-gray-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{place.address}</p>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-sm text-gray-400">
                              <FiMapPin className="mr-1" size={14} />
                              {place.distance}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                place.status === 'Open'
                                  ? 'bg-teal-500/20 text-teal-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {place.status}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            place.type === 'Hospital'
                              ? 'bg-accent-red/20'
                              : place.type === 'Clinic'
                              ? 'bg-accent-blue/20'
                              : 'bg-accent-green/20'
                          }`}
                        >
                          <svg className={`w-6 h-6 ${
                            place.type === 'Hospital' ? 'text-accent-red' : place.type === 'Clinic' ? 'text-accent-blue' : 'text-accent-green'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button className="flex-1 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2">
                          <FiPhone size={16} />
                          <span>Call</span>
                        </button>
                        <button className="flex-1 py-2 bg-accent-orange/20 hover:bg-accent-orange/30 text-accent-orange rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2">
                          <FiMapPin size={16} />
                          <span>Directions</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
