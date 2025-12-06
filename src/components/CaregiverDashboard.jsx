import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { subscribeToCaregiverAlerts, getCaregiverAlerts } from '../services/adherenceService';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiX, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';

const CaregiverDashboard = () => {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadAlerts(currentUser.uid);
        setupListener(currentUser.uid);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadAlerts = async (userId) => {
    setLoading(true);
    try {
      const result = await getCaregiverAlerts(userId);
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupListener = (userId) => {
    return subscribeToCaregiverAlerts(userId, (alertsData) => {
      setAlerts(alertsData);
    });
  };

  // Filter alerts
  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  // Group alerts by patient
  const patientGroups = alerts.reduce((acc, alert) => {
    const patientId = alert.patientId || 'unknown';
    if (!acc[patientId]) {
      acc[patientId] = {
        patientName: alert.patientName || 'Unknown Patient',
        alerts: []
      };
    }
    acc[patientId].alerts.push(alert);
    return acc;
  }, {});

  // Calculate stats
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    patients: Object.keys(patientGroups).length,
    missedDoses: alerts.filter(a => a.type === 'RISK_ALERT').length,
    expiredMeds: alerts.filter(a => a.type === 'EXPIRED_ALERT').length,
    wrongMeds: alerts.filter(a => a.type === 'WRONG_MED_ALERT').length
  };

  // Weekly adherence data (mock data - in production, calculate from actual logs)
  const weeklyData = [
    { day: 'Mon', taken: 12, missed: 2 },
    { day: 'Tue', taken: 14, missed: 1 },
    { day: 'Wed', taken: 11, missed: 3 },
    { day: 'Thu', taken: 13, missed: 2 },
    { day: 'Fri', taken: 15, missed: 0 },
    { day: 'Sat', taken: 14, missed: 1 },
    { day: 'Sun', taken: 13, missed: 2 }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/20';
      case 'high': return 'border-orange-500 bg-orange-500/20';
      default: return 'border-yellow-500 bg-yellow-500/20';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'RISK_ALERT': return <FiAlertTriangle className="text-orange-400" />;
      case 'EXPIRED_ALERT': return <FiX className="text-red-400" />;
      case 'WRONG_MED_ALERT': return <FiAlertTriangle className="text-red-400" />;
      default: return <FiAlertTriangle className="text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-orange mb-4"></div>
          <p className="text-gray-300 font-semibold">Loading caregiver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Caregiver Dashboard</h1>
          <p className="text-gray-400">Monitor patient medication adherence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-accent-purple/20 to-purple-500/20 border border-accent-purple/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Patients</p>
                <p className="text-4xl font-bold text-white mb-1">{stats.patients}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                <FiUsers className="text-accent-purple text-2xl" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Critical Alerts</p>
                <p className="text-4xl font-bold text-white mb-1">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="text-red-400 text-2xl" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-accent-orange/20 to-yellow-500/20 border border-accent-orange/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Missed Doses</p>
                <p className="text-4xl font-bold text-white mb-1">{stats.missedDoses}</p>
              </div>
              <div className="w-12 h-12 bg-accent-orange/20 rounded-xl flex items-center justify-center">
                <FiClock className="text-accent-orange text-2xl" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Alerts</p>
                <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <FiX className="text-yellow-400 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Weekly Adherence Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3d" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2a2f3d', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="taken" fill="#10b981" name="Taken" radius={[8, 8, 0, 0]} />
              <Bar dataKey="missed" fill="#ef4444" name="Missed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-accent-orange text-white shadow-lg'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover border border-dark-border'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setFilterType('RISK_ALERT')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === 'RISK_ALERT'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover border border-dark-border'
              }`}
            >
              Missed Doses ({stats.missedDoses})
            </button>
            <button
              onClick={() => setFilterType('EXPIRED_ALERT')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === 'EXPIRED_ALERT'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover border border-dark-border'
              }`}
            >
              Expired ({stats.expiredMeds})
            </button>
            <button
              onClick={() => setFilterType('WRONG_MED_ALERT')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === 'WRONG_MED_ALERT'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-dark-card text-gray-400 hover:bg-dark-hover border border-dark-border'
              }`}
            >
              Wrong Medicine ({stats.wrongMeds})
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Patient Alerts</h2>
          
          {filteredAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <FiCheckCircle className="text-6xl text-accent-green mx-auto mb-4" />
              <p className="text-gray-300 text-lg">No alerts to display</p>
              <p className="text-gray-500 text-sm mt-2">All patients are following their medication schedules</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(patientGroups).map(([patientId, group]) => {
                const patientAlerts = filterType === 'all' 
                  ? group.alerts 
                  : group.alerts.filter(a => a.type === filterType);
                
                if (patientAlerts.length === 0) return null;

                return (
                  <div key={patientId} className="card">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiUsers className="mr-2 text-purple-600" />
                        {group.patientName}
                      </h3>
                      <span className="badge bg-purple-100 text-purple-800">
                        {patientAlerts.length} {patientAlerts.length === 1 ? 'Alert' : 'Alerts'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {patientAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-xl border-l-4 ${
                            alert.severity === 'critical' 
                              ? 'bg-red-50 border-red-500' 
                              : alert.severity === 'high'
                              ? 'bg-orange-50 border-orange-500'
                              : 'bg-yellow-50 border-yellow-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="text-2xl mt-1">
                                {getAlertIcon(alert.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-1 rounded-full font-bold text-white ${getSeverityColor(alert.severity)}`}>
                                    {alert.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {alert.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                                  </span>
                                </div>
                                <p className="font-semibold text-gray-800 mb-1">
                                  {alert.type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-gray-700">{alert.message}</p>
                                {alert.medicationName && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-semibold">Medicine:</span> {alert.medicationName}
                                  </p>
                                )}
                                {alert.expiryDate && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Expiry:</span> {alert.expiryDate}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Safety Warnings */}
        {stats.critical > 0 && (
          <div className="card bg-red-50 border-2 border-red-500 mt-8">
            <div className="flex items-start">
              <FiAlertTriangle className="text-3xl text-red-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-2">⚠️ Critical Safety Warnings</h3>
                <p className="text-red-700">
                  There are {stats.critical} critical alerts requiring immediate attention. 
                  Please review and contact patients as necessary.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaregiverDashboard;
