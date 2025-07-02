import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Target, Award, Clock, Users, Activity, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gameScoreService from '../services/gameScoreAPI';
import '../styles/TherapistDashboard.css';

const TherapistDashboard = ({ handleLogout }) => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.userType === 'therapist') {
      fetchChildrenData();
    }
  }, [user]);
  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      console.log('🩺 TherapistDashboard: Fetching real children data...');
      
      // Fetch real children data from the backend
      const response = await gameScoreService.getChildrenData();
      
      if (response && response.children) {
        console.log(`✅ TherapistDashboard: Loaded ${response.children.length} children`);
        setChildrenData(response.children);
        
        // Log summary for debugging
        if (response.summary) {
          console.log('📊 Summary:', response.summary);
        }
      } else {
        console.warn('⚠️ No children data received');
        setChildrenData([]);
      }
    } catch (err) {
      console.error('❌ TherapistDashboard: Error fetching children data:', err);
      setError('Failed to load children data: ' + (err.message || 'Unknown error'));
      setChildrenData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = (child) => {
    const gameTypes = Object.keys(child.games);
    const avgScore = Math.round(gameTypes.reduce((sum, game) => sum + child.games[game].score, 0) / gameTypes.length);
    const avgImprovement = Math.round(gameTypes.reduce((sum, game) => sum + child.games[game].improvement, 0) / gameTypes.length);
    
    let cognitiveProfile = '';
    let recommendations = '';
    
    if (child.games['kitten-match'].score > 85) {
      cognitiveProfile += 'Strong visual-spatial processing and memory retention. ';
    }
    if (child.games['missing-letter-pop'].score > 80) {
      cognitiveProfile += 'Good linguistic processing and phonemic awareness. ';
    }
    if (child.games['art-studio'].score > 85) {
      cognitiveProfile += 'Excellent creative expression and fine motor skills. ';
    }
    
    if (avgImprovement > 12) {
      recommendations = 'Continue current intervention strategies. Consider advancing to more complex tasks to maintain engagement and challenge.';
    } else if (avgImprovement > 8) {
      recommendations = 'Moderate progress observed. Consider incorporating multi-sensory learning approaches and breaking tasks into smaller segments.';
    } else {
      recommendations = 'Progress slower than expected. Recommend increased session frequency, parental involvement, and exploring alternative learning modalities.';
    }

    return {
      cognitiveProfile: cognitiveProfile || 'Mixed cognitive profile with developing skills across domains.',
      recommendations,
      riskLevel: avgScore < 70 ? 'High Support Needed' : avgScore < 80 ? 'Moderate Support' : 'Low Support',
      progressTrend: avgImprovement > 10 ? 'Positive' : avgImprovement > 5 ? 'Stable' : 'Needs Attention'
    };
  };

  const getRadarData = (child) => [
    { subject: 'Memory', A: child.games['kitten-match'].score },
    { subject: 'Language', A: child.games['missing-letter-pop'].score },
    { subject: 'Creativity', A: child.games['art-studio'].score },
    { subject: 'Speed', A: Math.max(0, 100 - child.games['kitten-match'].time / 2) },
    { subject: 'Accuracy', A: Math.max(0, 100 - child.games['missing-letter-pop'].attempts * 10) },
    { subject: 'Consistency', A: Math.min(100, child.overallProgress + 10) }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="therapist-glass-card therapist-stat-card">
      <div className="therapist-stat-content">
        <h3 className="therapist-stat-title">{title}</h3>
        <p className="therapist-stat-value">{value}</p>
        {trend && (
          <div className="therapist-stat-trend">
            {trend > 0 ? (
              <TrendingUp className="text-green-300" size={16} />
            ) : (
              <TrendingDown className="text-red-300" size={16} />
            )}
            <span className="therapist-trend-text">{Math.abs(trend)}% from last week</span>
          </div>
        )}
      </div>
      <div className={`therapist-stat-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const ChildCard = ({ child, onClick }) => {
    const analysis = generateAnalysis(child);
    const getRiskClass = (level) => {
      switch(level) {
        case 'High Support Needed': return 'therapist-risk-high';
        case 'Moderate Support': return 'therapist-risk-moderate';
        default: return 'therapist-risk-low';
      }
    };

    return (
      <div className="therapist-glass-card therapist-child-card" onClick={() => onClick(child)}>
        <div className="therapist-child-header">
          <h3 className="therapist-child-name">{child.name}</h3>
          <span className="therapist-child-age">Age: {child.age}</span>
        </div>
        
        <div className="therapist-child-scores">
          <div className="therapist-score-item">
            <p className="therapist-score-label">Memory</p>
            <p className="therapist-score-value">{child.games['kitten-match'].score}</p>
          </div>
          <div className="therapist-score-item">
            <p className="therapist-score-label">Language</p>
            <p className="therapist-score-value">{child.games['missing-letter-pop'].score}</p>
          </div>
          <div className="therapist-score-item">
            <p className="therapist-score-label">Creativity</p>
            <p className="therapist-score-value">{child.games['art-studio'].score}</p>
          </div>
        </div>
        
        <div className="therapist-progress-section">
          <div className="therapist-progress-header">
            <span>Overall Progress</span>
            <span>{child.overallProgress}%</span>
          </div>
          <div className="therapist-progress-bar">
            <div 
              className="therapist-progress-fill"
              style={{ width: `${child.overallProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className={`therapist-risk-badge ${getRiskClass(analysis.riskLevel)}`}>
          {analysis.riskLevel}
        </div>
      </div>
    );
  };

  const DetailedAnalysis = ({ child, onBack }) => {
    const analysis = generateAnalysis(child);
    const radarData = getRadarData(child);
    
    const getMetricClass = (value, type) => {
      if (type === 'trend') {
        return value === 'Positive' ? 'therapist-metric-positive' : 
               value === 'Stable' ? 'therapist-metric-warning' : 'therapist-metric-danger';
      } else {
        return value === 'Low Support' ? 'therapist-metric-positive' :
               value === 'Moderate Support' ? 'therapist-metric-warning' : 'therapist-metric-danger';
      }
    };
    
    return (
      <div>
        <div className="therapist-analysis-header">
          <h2 className="therapist-analysis-title">{child.name} - Detailed Analysis</h2>
          <button className="therapist-back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            Back to Overview
          </button>
        </div>

        <div className="therapist-analysis-grid">
          <div className="therapist-glass-card therapist-chart-container">
            <h3 className="therapist-chart-title">Weekly Progress</h3>
            <div className="therapist-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={child.progressData}>
                  <CartesianGrid strokeDasharray="3,3" stroke="#ffffff30" />
                  <XAxis dataKey="week" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    fill="url(#colorScore)" 
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="therapist-glass-card therapist-chart-container">
            <h3 className="therapist-chart-title">Cognitive Profile</h3>
            <div className="therapist-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#ffffff30" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#ffffff80', fontSize: 10 }} />
                  <Radar 
                    name="Score" 
                    dataKey="A" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="therapist-game-performance-grid">
          <div className="therapist-glass-card therapist-game-card">
            <h4 className="therapist-game-title">🐱 Kitten Matching</h4>
            <div className="therapist-game-stats">
              <div className="therapist-game-stat">
                <span>Score:</span>
                <span className="therapist-game-stat-value">{child.games['kitten-match'].score}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Time:</span>
                <span>{child.games['kitten-match'].time}s</span>
              </div>
              <div className="therapist-game-stat">
                <span>Attempts:</span>
                <span>{child.games['kitten-match'].attempts}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Improvement:</span>
                <span className="therapist-improvement-positive">+{child.games['kitten-match'].improvement}%</span>
              </div>
              <div className="therapist-game-stat">
                <span>Total Played:</span>
                <span>{child.games['kitten-match'].totalPlayed}</span>
              </div>
            </div>
          </div>

          <div className="therapist-glass-card therapist-game-card">
            <h4 className="therapist-game-title">🔤 Missing Letter Pop</h4>
            <div className="therapist-game-stats">
              <div className="therapist-game-stat">
                <span>Score:</span>
                <span className="therapist-game-stat-value">{child.games['missing-letter-pop'].score}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Time:</span>
                <span>{child.games['missing-letter-pop'].time}s</span>
              </div>
              <div className="therapist-game-stat">
                <span>Attempts:</span>
                <span>{child.games['missing-letter-pop'].attempts}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Improvement:</span>
                <span className="therapist-improvement-positive">+{child.games['missing-letter-pop'].improvement}%</span>
              </div>
              <div className="therapist-game-stat">
                <span>Total Played:</span>
                <span>{child.games['missing-letter-pop'].totalPlayed}</span>
              </div>
            </div>
          </div>

          <div className="therapist-glass-card therapist-game-card">
            <h4 className="therapist-game-title">🎨 Art Studio</h4>
            <div className="therapist-game-stats">
              <div className="therapist-game-stat">
                <span>Score:</span>
                <span className="therapist-game-stat-value">{child.games['art-studio'].score}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Time:</span>
                <span>{child.games['art-studio'].time}s</span>
              </div>
              <div className="therapist-game-stat">
                <span>Attempts:</span>
                <span>{child.games['art-studio'].attempts}</span>
              </div>
              <div className="therapist-game-stat">
                <span>Improvement:</span>
                <span className="therapist-improvement-positive">+{child.games['art-studio'].improvement}%</span>
              </div>
              <div className="therapist-game-stat">
                <span>Total Played:</span>
                <span>{child.games['art-studio'].totalPlayed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="therapist-glass-card therapist-analysis-summary">
          <h3 className="therapist-summary-title">Cognitive Analysis & Recommendations</h3>
          <div className="therapist-summary-section">
            <h4>Cognitive Profile:</h4>
            <p>{analysis.cognitiveProfile}</p>
          </div>
          
          <div className="therapist-summary-section">
            <h4>Strengths:</h4>
            <div className="therapist-tags-container">
              {child.strengths.map((strength, index) => (
                <span key={index} className="therapist-tag therapist-tag-strength">
                  {strength}
                </span>
              ))}
            </div>
          </div>
          
          <div className="therapist-summary-section">
            <h4>Areas for Development:</h4>
            <div className="therapist-tags-container">
              {child.challenges.map((challenge, index) => (
                <span key={index} className="therapist-tag therapist-tag-challenge">
                  {challenge}
                </span>
              ))}
            </div>
          </div>
          
          <div className="therapist-summary-section">
            <h4>Therapeutic Recommendations:</h4>
            <p>{analysis.recommendations}</p>
          </div>
          
          <div className="therapist-summary-metrics">
            <div className="therapist-metric-item">
              <p className="therapist-metric-label">Progress Trend</p>
              <span className={`therapist-metric-value ${getMetricClass(analysis.progressTrend, 'trend')}`}>
                {analysis.progressTrend}
              </span>
            </div>
            <div className="therapist-metric-item">
              <p className="therapist-metric-label">Support Level</p>
              <span className={`therapist-metric-value ${getMetricClass(analysis.riskLevel, 'risk')}`}>
                {analysis.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user || user.userType !== 'therapist') {
    return (
      <div className="therapist-dashboard-container">
        <div className="therapist-main-content">
          <div className="therapist-error-message">
            <h2>Access Denied</h2>
            <p>This dashboard is only accessible to therapists.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="therapist-dashboard-container">
        <div className="therapist-main-content">
          <div className="therapist-loading">
            <Activity className="animate-spin" size={48} />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="therapist-dashboard-container">
        <div className="therapist-main-content">
          <div className="therapist-error-message">
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchChildrenData} className="therapist-retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedChild) {
    return (
      <div className="therapist-dashboard-container">
        <div className="therapist-main-content">
          <DetailedAnalysis child={selectedChild} onBack={() => setSelectedChild(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="therapist-dashboard-container">
      {/* Medical floating elements */}
      <div className="medical-float-1"></div>
      <div className="medical-float-2"></div>
      
      <div className="therapist-main-content">        <div className="therapist-dashboard-header">
          <h1 className="therapist-dashboard-title">
            JoyVerse Therapy Dashboard
          </h1>
          <p className="therapist-dashboard-subtitle">
            Comprehensive cognitive assessment and progress tracking for children with learning differences
          </p>
          {handleLogout && (
            <div className="therapist-header-actions">
              <span className="therapist-welcome-text">Welcome, Dr. {user?.fullName || 'Therapist'}</span>
              <button onClick={handleLogout} className="therapist-logout-button">
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="therapist-stats-grid">
          <StatCard 
            title="Total Children"
            value={childrenData.length}
            icon={Users}
            trend={2}
            colorClass="therapist-icon-blue"
          />
          <StatCard 
            title="Average Progress"
            value={`${Math.round(childrenData.reduce((acc, child) => acc + child.overallProgress, 0) / (childrenData.length || 1))}%`}
            icon={TrendingUp}
            trend={8}
            colorClass="therapist-icon-green"
          />
          <StatCard 
            title="Active Sessions"
            value="24"
            icon={Activity}
            trend={12}
            colorClass="therapist-icon-purple"
          />
          <StatCard 
            title="Avg Improvement"
            value={`${Math.round(childrenData.reduce((acc, child) => {
              const games = Object.values(child.games);
              const avgImp = games.reduce((sum, game) => sum + game.improvement, 0) / games.length;
              return acc + avgImp;
            }, 0) / (childrenData.length || 1))}%`}
            icon={Award}
            trend={5}
            colorClass="therapist-icon-orange"
          />
        </div>        <div>
          <h2 className="therapist-section-header">Children Overview</h2>
          {childrenData.length === 0 ? (
            <div className="therapist-glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
                No Children Data Available
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
                There are currently no children registered in the system, or no children have started playing games yet.
              </p>
              <button 
                onClick={fetchChildrenData} 
                className="therapist-retry-button"
                style={{ margin: '0 auto' }}
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="therapist-children-grid">
              {childrenData.map((child) => (
                <ChildCard 
                  key={child.id} 
                  child={child} 
                  onClick={setSelectedChild}
                />
              ))}
            </div>
          )}
        </div>

        <div className="therapist-analytics-grid">
          <div className="therapist-glass-card therapist-chart-container">
            <h3 className="therapist-chart-title">Game Performance Comparison</h3>
            <div className="therapist-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={childrenData.map(child => ({
                  name: child.name.split(' ')[0],
                  Memory: child.games['kitten-match'].score,
                  Language: child.games['missing-letter-pop'].score,
                  Creativity: child.games['art-studio'].score
                }))}>
                  <CartesianGrid strokeDasharray="3,3" stroke="#ffffff30" />
                  <XAxis dataKey="name" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="Memory" fill="#8884d8" />
                  <Bar dataKey="Language" fill="#82ca9d" />
                  <Bar dataKey="Creativity" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="therapist-glass-card therapist-chart-container">
            <h3 className="therapist-chart-title">Support Level Distribution</h3>
            <div className="therapist-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Low Support', value: childrenData.filter(c => generateAnalysis(c).riskLevel === 'Low Support').length },
                      { name: 'Moderate Support', value: childrenData.filter(c => generateAnalysis(c).riskLevel === 'Moderate Support').length },
                      { name: 'High Support Needed', value: childrenData.filter(c => generateAnalysis(c).riskLevel === 'High Support Needed').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#82ca9d" />
                    <Cell fill="#ffc658" />
                    <Cell fill="#ff7c7c" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="therapist-dashboard-footer">
          <p className="therapist-footer-text">
            Dashboard updates automatically • Click on any child for detailed analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
