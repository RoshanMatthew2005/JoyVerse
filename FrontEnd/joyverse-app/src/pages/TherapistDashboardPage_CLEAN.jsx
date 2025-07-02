import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Brain, Activity, TrendingUp, TrendingDown, Calendar, FileText, Heart, Eye, AlertCircle, CheckCircle, Clock, Target, BarChart3, PieChart, Download, Settings, Bell, Search, Filter, ChevronRight, Stethoscope, ClipboardList, Star, User, MessageSquare, BookOpen, Award, Shield, UserCheck, Zap, TrendingUp as TrendingIcon, Plus, Edit, ExternalLink, Home } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell, ComposedChart } from 'recharts';
import { authAPI } from '../services/authAPI';
import { useAuth } from '../context/AuthContext';

const TherapistDashboardPage = ({ setCurrentPage }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [filterByRisk, setFilterByRisk] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout, user } = useAuth();

  console.log('🏥 TherapistDashboardPage rendering - User:', user);

  const handleLogout = () => {
    logout();
    setCurrentPage('welcome');
  };

  // Load real data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading therapist dashboard data...');
        const response = await authAPI.getTherapistDashboard();
        console.log('Dashboard data received:', response);
        
        const children = Array.isArray(response.children) ? response.children : [];
        setChildrenData(children);
        console.log('Children data set:', children);
        
        // Generate mock notifications
        generateNotifications(children);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Using sample data.');
        // Fallback to sample data if API fails
        const sampleData = getSampleData();
        setChildrenData(sampleData);
        generateNotifications(sampleData);
        console.log('Using sample data:', sampleData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Generate mock notifications
  const generateNotifications = (children) => {
    const mockNotifications = [
      {
        id: 1,
        type: 'alert',
        title: 'High Support Alert',
        message: `${children[0]?.name || 'A child'} needs additional intervention`,
        time: '5 min ago',
        priority: 'high'
      },
      {
        id: 2,
        type: 'success',
        title: 'Progress Milestone',
        message: `${children[1]?.name || 'A child'} achieved 80% completion rate`,
        time: '1 hour ago',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'info',
        title: 'Session Reminder',
        message: 'Weekly progress review due tomorrow',
        time: '2 hours ago',
        priority: 'low'
      }
    ];
    setNotifications(mockNotifications);
  };

  // Sample data fallback
  const getSampleData = () => [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      games: {
        kittenMatching: { score: 85, time: 120, attempts: 3, improvement: 15 },
        spaceMath: { score: 72, time: 180, attempts: 5, improvement: 8 },
        bubblePop: { score: 91, time: 95, attempts: 2, improvement: 12 }
      },
      overallProgress: 82,
      strengths: ['Visual Memory', 'Pattern Recognition'],
      challenges: ['Mathematical Processing', 'Time Management'],
      progressData: [
        { week: 'Week 1', score: 65 },
        { week: 'Week 2', score: 70 },
        { week: 'Week 3', score: 78 },
        { week: 'Week 4', score: 82 }
      ]
    },
    {
      id: 2,
      name: 'Oliver Smith',
      age: 9,
      games: {
        kittenMatching: { score: 78, time: 140, attempts: 4, improvement: 10 },
        spaceMath: { score: 88, time: 150, attempts: 3, improvement: 18 },
        bubblePop: { score: 75, time: 110, attempts: 4, improvement: 6 }
      },
      overallProgress: 80,
      strengths: ['Logical Thinking', 'Problem Solving'],
      challenges: ['Visual Processing', 'Attention Span'],
      progressData: [
        { week: 'Week 1', score: 60 },
        { week: 'Week 2', score: 68 },
        { week: 'Week 3', score: 75 },
        { week: 'Week 4', score: 80 }
      ]
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: 7,
      games: {
        kittenMatching: { score: 92, time: 100, attempts: 2, improvement: 20 },
        spaceMath: { score: 68, time: 200, attempts: 6, improvement: 5 },
        bubblePop: { score: 87, time: 85, attempts: 3, improvement: 14 }
      },
      overallProgress: 86,
      strengths: ['Quick Processing', 'Visual Memory'],
      challenges: ['Mathematical Concepts', 'Sequential Processing'],
      progressData: [
        { week: 'Week 1', score: 70 },
        { week: 'Week 2', score: 76 },
        { week: 'Week 3', score: 82 },
        { week: 'Week 4', score: 86 }
      ]
    },
    {
      id: 4,
      name: 'Lucas Wilson',
      age: 10,
      games: {
        kittenMatching: { score: 73, time: 160, attempts: 5, improvement: 7 },
        spaceMath: { score: 81, time: 170, attempts: 4, improvement: 12 },
        bubblePop: { score: 79, time: 125, attempts: 3, improvement: 9 }
      },
      overallProgress: 78,
      strengths: ['Persistence', 'Analytical Skills'],
      challenges: ['Processing Speed', 'Working Memory'],
      progressData: [
        { week: 'Week 1', score: 62 },
        { week: 'Week 2', score: 69 },
        { week: 'Week 3', score: 74 },
        { week: 'Week 4', score: 78 }
      ]
    }
  ];

  // Helper functions for data processing
  const generateAnalysis = (child) => {
    const avgScore = Math.round((child.games.kittenMatching.score + child.games.spaceMath.score + child.games.bubblePop.score) / 3);
    const avgImprovement = Math.round((child.games.kittenMatching.improvement + child.games.spaceMath.improvement + child.games.bubblePop.improvement) / 3);
    
    return {
      riskLevel: avgScore < 70 ? 'High Support' : avgScore < 80 ? 'Moderate Support' : 'Low Support',
      progressTrend: avgImprovement > 10 ? 'Positive' : avgImprovement > 5 ? 'Stable' : 'Needs Attention'
    };
  };

  const getRadarData = (child) => [
    { subject: 'Memory', performance: child.games.kittenMatching.score },
    { subject: 'Math Skills', performance: child.games.spaceMath.score },
    { subject: 'Attention', performance: child.games.bubblePop.score },
    { subject: 'Speed', performance: Math.max(0, 100 - child.games.kittenMatching.time / 2) },
    { subject: 'Accuracy', performance: Math.max(0, 100 - child.games.spaceMath.attempts * 10) },
    { subject: 'Consistency', performance: Math.min(100, child.overallProgress + 10) }
  ];

  const getGamePerformanceData = (child) => [
    { game: 'Kitten Match', score: child.games.kittenMatching.score, improvement: child.games.kittenMatching.improvement },
    { game: 'Space Math', score: child.games.spaceMath.score, improvement: child.games.spaceMath.improvement },
    { game: 'Bubble Pop', score: child.games.bubblePop.score, improvement: child.games.bubblePop.improvement }
  ];

  const getWeeklyProgressData = () => [
    { day: 'Mon', progress: 75 },
    { day: 'Tue', progress: 78 },
    { day: 'Wed', progress: 82 },
    { day: 'Thu', progress: 79 },
    { day: 'Fri', progress: 85 },
    { day: 'Sat', progress: 88 },
    { day: 'Sun', progress: 83 }
  ];

  const getEmotionData = () => [
    { name: 'Happy', value: 45 },
    { name: 'Focused', value: 30 },
    { name: 'Frustrated', value: 15 },
    { name: 'Confused', value: 7 },
    { name: 'Excited', value: 3 }
  ];

  const getReports = () => [
    {
      id: 1,
      title: 'Weekly Progress Report',
      description: 'Comprehensive analysis of all children',
      details: 'Generated weekly progress summary with individual assessments, trend analysis, and intervention recommendations for all children in your care.',
      action: 'Generate Report',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'rgba(59, 130, 246, 0.3)'
    },
    {
      id: 2,
      title: 'Risk Assessment',
      description: 'Children requiring additional support',
      details: 'Detailed analysis of children showing signs of needing additional intervention, with specific recommendations and priority levels.',
      action: 'View Assessment',
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      color: 'rgba(239, 68, 68, 0.3)'
    },
    {
      id: 3,
      title: 'Performance Analytics',
      description: 'Cognitive performance trends',
      details: 'Deep dive into cognitive performance patterns across different game types, with insights into learning patterns and areas of strength.',
      action: 'View Analytics',
      icon: <Brain className="w-6 h-6 text-white" />,
      color: 'rgba(16, 185, 129, 0.3)'
    }
  ];

  // Filter children based on search and risk level
  const filteredChildren = childrenData.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
    const analysis = generateAnalysis(child);
    const matchesRisk = filterByRisk === 'all' || 
      (filterByRisk === 'high' && analysis.riskLevel === 'High Support') ||
      (filterByRisk === 'moderate' && analysis.riskLevel === 'Moderate Support') ||
      (filterByRisk === 'low' && analysis.riskLevel === 'Low Support');
    
    return matchesSearch && matchesRisk;
  });

  // Styling
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2a082a 0%, #1a0b2e 50%, #0d0d2b 100%)',
      color: 'white',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    childrenGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem',
      marginTop: '2rem'
    },
    chartContainer: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    chartTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    chartWrapper: {
      height: '300px',
      width: '100%'
    },
    detailModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      background: 'linear-gradient(135deg, #2a082a 0%, #1a0b2e 50%, #0d0d2b 100%)',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      cursor: 'pointer',
      fontSize: '1.25rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1.125rem'
    },
    section: {
      marginBottom: '2rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <Brain className="w-12 h-12 text-blue-400 animate-pulse mx-auto" />
            </div>
            <p style={{ color: 'white', fontSize: '1.25rem' }}>Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Navigation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(42, 8, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1440px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Logout
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope className="w-6 h-6 text-blue-400" />
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
                JoyVerse Clinical Dashboard
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['overview', 'analytics', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: activeTab === tab ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: activeTab === tab ? '#3b82f6' : 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'rgba(0, 0, 0, 0.9)',
                borderRadius: '12px',
                padding: '1rem',
                minWidth: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                  Notifications
                </h4>
                {notifications.map(notification => (
                  <div key={notification.id} style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${notification.priority === 'high' ? '#ef4444' : notification.priority === 'medium' ? '#f59e0b' : '#3b82f6'}`
                  }}>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {notification.title}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      {notification.message}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.625rem' }}>
                      {notification.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', maxWidth: '1440px', margin: '0 auto', padding: '100px 2rem 2rem' }}>
        {/* Welcome Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Welcome, Dr. {user?.name || 'Therapist'}
          </h1>
          <p style={styles.subtitle}>
            Professional dashboard for monitoring children with dyslexia • {childrenData.length} active patients
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <select
            value={filterByRisk}
            onChange={(e) => setFilterByRisk(e.target.value)}
            style={{
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem'
            }}
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Support</option>
            <option value="moderate">Moderate Support</option>
            <option value="low">Low Support</option>
          </select>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={{ ...styles.glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Children</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                    {Array.isArray(childrenData) ? childrenData.length : 0}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <TrendingUp className="text-green-300" />
                    <span>2 new this month</span>
                  </div>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users />
                </div>
              </div>

              <div style={{ ...styles.glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Average Progress</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                    {childrenData.length > 0 ? Math.round(childrenData.reduce((sum, child) => sum + child.overallProgress, 0) / childrenData.length) : 0}%
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <TrendingUp className="text-green-300" />
                    <span>12% this week</span>
                  </div>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity />
                </div>
              </div>

              <div style={{ ...styles.glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>High Support Needed</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                    {childrenData.filter(child => generateAnalysis(child).riskLevel === 'High Support').length}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <AlertCircle className="text-red-300" />
                    <span>Immediate attention</span>
                  </div>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle />
                </div>
              </div>

              <div style={{ ...styles.glassCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Sessions This Week</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>24</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <Calendar className="text-purple-300" />
                    <span>6 scheduled today</span>
                  </div>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(147, 51, 234, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={styles.chartsGrid}>
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Weekly Progress Trends</h3>
                <div style={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getWeeklyProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Emotion Distribution</h3>
                <div style={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getEmotionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getEmotionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Children Grid */}
            <div style={styles.childrenGrid}>
              {filteredChildren.map((child) => {
                const analysis = generateAnalysis(child);
                return (
                  <div 
                    key={child.id}
                    style={{
                      ...styles.glassCard,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedChild?.id === child.id ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => setSelectedChild(child)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {child.name}
                        </h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                          Age {child.age} • {child.sessionCount || 12} sessions
                        </p>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: analysis.riskLevel === 'Low Support' ? 'rgba(16, 185, 129, 0.2)' : 
                                        analysis.riskLevel === 'Moderate Support' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: analysis.riskLevel === 'Low Support' ? '#10b981' : 
                               analysis.riskLevel === 'Moderate Support' ? '#f59e0b' : '#ef4444',
                        border: `1px solid ${analysis.riskLevel === 'Low Support' ? '#10b981' : 
                                            analysis.riskLevel === 'Moderate Support' ? '#f59e0b' : '#ef4444'}`
                      }}>
                        {analysis.riskLevel}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Overall Progress</span>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{child.overallProgress}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${child.overallProgress}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, #3b82f6, #10b981)`,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                      {Object.entries(child.games).map(([game, data]) => (
                        <div key={game} style={{ textAlign: 'center' }}>
                          <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            {game === 'kittenMatching' ? 'Kitten' : game === 'spaceMath' ? 'Math' : 'Bubble'}
                          </div>
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {data.score}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {analysis.progressTrend === 'Positive' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : analysis.progressTrend === 'Stable' ? (
                          <BarChart3 className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span style={{ 
                          color: analysis.progressTrend === 'Positive' ? '#10b981' : 
                                 analysis.progressTrend === 'Stable' ? '#f59e0b' : '#ef4444',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {analysis.progressTrend}
                        </span>
                      </div>
                      <button style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid #3b82f6',
                        color: '#3b82f6',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={styles.section}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              Clinical Reports & Analytics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {getReports().map(report => (
                <div key={report.id} style={{ ...styles.glassCard, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '12px',
                      backgroundColor: report.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {report.icon}
                    </div>
                    <div>
                      <h4 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {report.title}
                      </h4>
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {report.details}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid #3b82f6',
                      color: '#3b82f6',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      flex: 1
                    }}>
                      {report.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Detail Modal */}
        {selectedChild && (
          <div style={styles.detailModal} onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedChild(null);
          }}>
            <div style={styles.modalContent}>
              <button 
                style={styles.closeButton}
                onClick={() => setSelectedChild(null)}
              >
                ×
              </button>
              
              <div style={styles.header}>
                <h2 style={styles.title}>{selectedChild.name} - Detailed Analysis</h2>
                <p style={styles.subtitle}>Age {selectedChild.age} • Comprehensive Cognitive Assessment</p>
              </div>

              <div style={styles.statsGrid}>
                {(() => {
                  const analysis = generateAnalysis(selectedChild);
                  return (
                    <>
                      <div style={{ ...styles.glassCard, padding: '1.5rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Shield className="w-5 h-5" />
                          Risk Level
                        </h4>
                        <p style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold', 
                          color: analysis.riskLevel === 'Low Support' ? '#4ade80' : 
                                 analysis.riskLevel === 'Moderate Support' ? '#f59e0b' : '#ef4444'
                        }}>
                          {analysis.riskLevel}
                        </p>
                      </div>
                      
                      <div style={{ ...styles.glassCard, padding: '1.5rem' }}>
                        <h4 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TrendingIcon className="w-5 h-5" />
                          Progress Trend
                        </h4>
                        <p style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold', 
                          color: analysis.progressTrend === 'Positive' ? '#4ade80' : 
                                 analysis.progressTrend === 'Stable' ? '#f59e0b' : '#ef4444'
                        }}>
                          {analysis.progressTrend}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={styles.chartsGrid}>
                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Cognitive Profile Radar</h3>
                  <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData(selectedChild)}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 12 }} />
                        <PolarRadiusAxis 
                          angle={0} 
                          domain={[0, 100]} 
                          tick={{ fill: 'white', fontSize: 10 }}
                          tickCount={4}
                        />
                        <Radar 
                          name="Performance" 
                          dataKey="performance" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Game Performance Breakdown</h3>
                  <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getGamePerformanceData(selectedChild)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="game" stroke="rgba(255,255,255,0.6)" />
                        <YAxis stroke="rgba(255,255,255,0.6)" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="score" fill="#3b82f6" />
                        <Bar dataKey="improvement" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.glassCard, padding: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList className="w-5 h-5" />
                  Clinical Notes & Recommendations
                </h4>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Current Assessment:</strong> {selectedChild.name} shows {generateAnalysis(selectedChild).progressTrend.toLowerCase()} progress patterns 
                    with {generateAnalysis(selectedChild).riskLevel.toLowerCase()} intervention needs. Performance indicates strong engagement in visual-spatial tasks.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Recommended Interventions:</strong>
                  </p>
                  <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li>Continue structured reading exercises with phonetic support</li>
                    <li>Increase visual processing games to strengthen pattern recognition</li>
                    <li>Weekly progress monitoring sessions</li>
                    {generateAnalysis(selectedChild).riskLevel === 'High Support' && <li><strong>Priority:</strong> Schedule immediate one-on-one session</li>}
                  </ul>
                  <p>
                    <strong>Next Review:</strong> {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid #3b82f6',
                  color: '#3b82f6',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar className="w-4 h-4" />
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem 0' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            🧠 JoyVerse Clinical Dashboard • Professional therapy management for children with dyslexia
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Dashboard updates automatically • Click on any child for detailed analysis • Use tabs to navigate different views
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboardPage;
