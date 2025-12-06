import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getMedications, subscribeToMedications, getMedicationsDueNow, getNextMedication } from '../services/medicationService';
import { getAlerts, subscribeToAlerts, getAdherenceLogs, getAdherenceStats } from '../services/adherenceService';
import { sendBrowserNotification, sendCaretakerAlert, startAutoReminder, requestNotificationPermission, playNotificationSound } from '../services/notificationService';
import Sidebar from '../components/Sidebar';
import { FiPlusCircle, FiClock, FiMapPin, FiPhone, FiInfo, FiAlertCircle, FiUser, FiMail, FiActivity } from 'react-icons/fi';
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
  const [personalDoctor, setPersonalDoctor] = useState(null);
  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [showDietPlan, setShowDietPlan] = useState(false);
  const [missedMedications, setMissedMedications] = useState([]);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const GOOGLE_API_KEY = 'AIzaSyDiQMYby9u549HpU6D-1l-FmrUi_DglFTw';

  // Personal Doctor Data
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Rajesh Kumar',
    specialization: 'General Physician',
    phone: '+91 98765 43210',
    email: 'dr.rajesh@healthcare.com',
    clinic: 'Apollo Medical Center',
    address: 'MG Road, Bangalore',
    available: 'Mon-Sat, 9:00 AM - 6:00 PM'
  });

  // AI Diet Recommendations (Indian Diet)
  const indianDietPlan = [
    {
      meal: 'Early Morning (6:00 AM)',
      items: 'Warm water with lemon + 5 soaked almonds',
      calories: '50 kcal',
      benefits: 'Boosts metabolism, aids digestion'
    },
    {
      meal: 'Breakfast (8:00 AM)',
      items: 'Idli (3) + Sambar + Coconut chutney OR Oats upma + Green tea',
      calories: '350 kcal',
      benefits: 'Rich in fiber, controls blood sugar'
    },
    {
      meal: 'Mid-Morning (11:00 AM)',
      items: 'Buttermilk (1 glass) + 1 Fruit (Apple/Papaya)',
      calories: '120 kcal',
      benefits: 'Probiotic, vitamin-rich'
    },
    {
      meal: 'Lunch (1:00 PM)',
      items: 'Brown rice (1 cup) + Dal + Mixed veg curry + Curd + Salad',
      calories: '450 kcal',
      benefits: 'Balanced nutrients, protein-rich'
    },
    {
      meal: 'Evening Snack (4:00 PM)',
      items: 'Sprouts chaat + Green tea OR Roasted chana',
      calories: '150 kcal',
      benefits: 'Protein boost, energy sustaining'
    },
    {
      meal: 'Dinner (7:30 PM)',
      items: 'Roti (2) + Palak paneer + Cucumber raita + Salad',
      calories: '400 kcal',
      benefits: 'Light dinner, easy digestion'
    },
    {
      meal: 'Before Bed (9:30 PM)',
      items: 'Warm turmeric milk',
      calories: '80 kcal',
      benefits: 'Anti-inflammatory, better sleep'
    }
  ];

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

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Load personal doctor and caretaker info
  useEffect(() => {
    const loadPersonalInfo = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.personalDoctor) {
              setDoctorInfo(userData.personalDoctor);
            }
            if (userData.caretakerEmail) {
              setCaretakerEmail(userData.caretakerEmail);
            }
          }
        } catch (error) {
          console.error('Error loading personal info:', error);
        }
      }
    };
    loadPersonalInfo();
  }, [user]);

  // Automatic reminder system with 5-minute intervals
  useEffect(() => {
    const checkMedicationReminders = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      todayMedications.forEach((med) => {
        if (med.status === 'pending') {
          const [time, period] = med.time.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let medTime = hours * 60 + minutes;
          if (period === 'PM' && hours !== 12) medTime += 720;
          if (period === 'AM' && hours === 12) medTime -= 720;

          const timeDiff = currentTime - medTime;

          // If medication is overdue by 5+ minutes
          if (timeDiff >= 5 && timeDiff % 5 === 0) {
            sendReminderNotification(med);
            if (timeDiff >= 30 && caretakerEmail) {
              handleCaretakerAlert(med);
            }
          }
        }
      });
    };

    const interval = setInterval(checkMedicationReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [todayMedications, caretakerEmail]);

  // Send reminder notification
  const sendReminderNotification = (medication) => {
    sendBrowserNotification(
      '💊 Medication Reminder',
      `Time to take ${medication.name} ${medication.dosage}`,
      '/logo192.png'
    );
    playNotificationSound();
  };

  // Send alert to caretaker
  const handleCaretakerAlert = async (medication) => {
    if (user && caretakerEmail) {
      await sendCaretakerAlert(user.uid, caretakerEmail, medication);
      
      // Add to missed medications list
      setMissedMedications(prev => [...prev, {
        ...medication,
        missedAt: new Date().toLocaleTimeString()
      }]);
    }
  };

  // Fetch nearby medical facilities using Google Places API
  const fetchNearbyPlaces = async (lat = 12.9716, lng = 77.5946) => {
    try {
      if (window.google && window.google.maps) {
        const map = new window.google.maps.Map(document.createElement('div'));
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
          location: new window.google.maps.LatLng(lat, lng),
          radius: 5000,
          type: 'hospital'
        };

        service.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const hospitals = results.slice(0, 6).map((place, index) => ({
              id: index + 1,
              name: place.name,
              address: place.vicinity,
              distance: ((index + 5) / 10).toFixed(1) + ' km away',
              type: place.types.includes('hospital') ? 'Hospital' : 'Clinic',
              status: place.opening_hours?.open_now ? 'Open' : 'Closed',
              rating: place.rating || 4.0,
              phone: place.formatted_phone_number || 'N/A',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }));
            setNearbyPlaces(hospitals);
          } else {
            loadFallbackPlaces();
          }
        });
      } else {
        loadFallbackPlaces();
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      loadFallbackPlaces();
    }
  };

  const loadFallbackPlaces = () => {
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

  // Load nearby places on map view
  useEffect(() => {
    if (showMap && nearbyPlaces.length === 0) {
      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
          },
          () => {
            // Fallback to default location (Bangalore)
            fetchNearbyPlaces();
          }
        );
      } else {
        fetchNearbyPlaces();
      }
    }
  }, [showMap]);

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
                {/* Personal Doctor Card */}
                <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiUser className="text-teal-400" />
                    <h3 className="text-white font-bold text-sm">My Personal Doctor</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">{doctorInfo.name}</p>
                    <p className="text-gray-400 text-xs">{doctorInfo.specialization}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <FiPhone className="text-teal-400 text-xs" />
                      <a href={`tel:${doctorInfo.phone}`} className="text-teal-400 text-xs hover:underline">
                        {doctorInfo.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMail className="text-teal-400 text-xs" />
                      <a href={`mailto:${doctorInfo.email}`} className="text-teal-400 text-xs hover:underline">
                        {doctorInfo.email}
                      </a>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">{doctorInfo.clinic}</p>
                    <p className="text-gray-500 text-xs">{doctorInfo.available}</p>
                  </div>
                </div>

                {/* AI Diet Suggestions */}
                <button 
                  onClick={() => setShowDietPlan(!showDietPlan)}
                  className="w-full text-left p-4 bg-dark-bg hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-accent-green" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">AI Diet Plan</p>
                      <p className="text-gray-400 text-xs">Balanced Indian diet (1600 kcal)</p>
                    </div>
                  </div>
                </button>

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

      {/* Diet Plan Modal */}
      {showDietPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-card border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">AI Recommended Diet Plan</h2>
                <p className="text-gray-400 text-sm">Balanced Indian Diet - Total: 1600 kcal/day</p>
              </div>
              <button 
                onClick={() => setShowDietPlan(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {indianDietPlan.map((plan, index) => (
                <div 
                  key={index} 
                  className="bg-dark-bg border border-gray-700 rounded-xl p-5 hover:border-accent-green/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{plan.meal}</h3>
                      <p className="text-accent-green text-sm font-semibold">{plan.calories}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500/20' :
                      index === 1 ? 'bg-orange-500/20' :
                      index === 2 ? 'bg-green-500/20' :
                      index === 3 ? 'bg-blue-500/20' :
                      index === 4 ? 'bg-purple-500/20' :
                      index === 5 ? 'bg-pink-500/20' : 'bg-indigo-500/20'
                    }`}>
                      <span className="text-2xl">
                        {index === 0 ? '🌅' : index === 1 ? '🍽️' : index === 2 ? '🥤' : 
                         index === 3 ? '🍛' : index === 4 ? '🍵' : index === 5 ? '🌙' : '🥛'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-400 text-sm font-semibold mt-0.5">Food:</span>
                      <p className="text-gray-300 text-sm flex-1">{plan.items}</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-400 text-sm font-semibold mt-0.5">Benefits:</span>
                      <p className="text-gray-400 text-sm flex-1 italic">{plan.benefits}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-br from-accent-green/20 to-emerald-500/20 border border-accent-green/30 rounded-xl p-6 mt-6">
                <h3 className="text-white font-bold text-lg mb-3">💡 General Guidelines</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent-green mt-1">•</span>
                    <span>Drink 8-10 glasses of water throughout the day</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent-green mt-1">•</span>
                    <span>Avoid processed foods, excessive sugar, and fried items</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent-green mt-1">•</span>
                    <span>Include 30 minutes of light exercise daily (walking/yoga)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent-green mt-1">•</span>
                    <span>Maintain consistent meal timings for better medication absorption</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent-green mt-1">•</span>
                    <span>Consult your doctor before making major dietary changes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
