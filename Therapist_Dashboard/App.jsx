import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Target, Award, Clock, Users, Activity } from 'lucide-react';
import './App.css';

const TherapistDashboard = () => {
  const [selectedChild, setSelectedChild] = useState(null);

  // Sample data for dyslexic children
  const childrenData = [
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

  const generateAnalysis = (child) => {
    const avgScore = Math.round((child.games.kittenMatching.score + child.games.spaceMath.score + child.games.bubblePop.score) / 3);
    const avgImprovement = Math.round((child.games.kittenMatching.improvement + child.games.spaceMath.improvement + child.games.bubblePop.improvement) / 3);
    
    let cognitiveProfile = '';
    let recommendations = '';
    
    if (child.games.kittenMatching.score > 85) {
      cognitiveProfile += 'Strong visual-spatial processing and memory retention. ';
    }
    if (child.games.spaceMath.score > 80) {
      cognitiveProfile += 'Good mathematical reasoning and number sense. ';
    }
    if (child.games.bubblePop.score > 85) {
      cognitiveProfile += 'Excellent attention control and rapid decision-making. ';
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
    { subject: 'Memory', A: child.games.kittenMatching.score },
    { subject: 'Math Skills', A: child.games.spaceMath.score },
    { subject: 'Attention', A: child.games.bubblePop.score },
    { subject: 'Speed', A: Math.max(0, 100 - child.games.kittenMatching.time / 2) },
    { subject: 'Accuracy', A: Math.max(0, 100 - child.games.spaceMath.attempts * 10) },
    { subject: 'Consistency', A: Math.min(100, child.overallProgress + 10) }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="glass-card stat-card">
      <div className="stat-content">
        <h3>{title}</h3>
        <p>{value}</p>
        {trend && (
          <div className="stat-trend">
            {trend > 0 ? (
              <TrendingUp className="text-green-300" />
            ) : (
              <TrendingDown className="text-red-300" />
            )}
            <span>{Math.abs(trend)}% from last week</span>
          </div>
        )}
      </div>
      <div className={`stat-icon ${colorClass}`}>
        <Icon />
      </div>
    </div>
  );

  const ChildCard = ({ child, onClick }) => {
    const analysis = generateAnalysis(child);
    const getRiskClass = (level) => {
      switch(level) {
        case 'High Support Needed': return 'risk-high';
        case 'Moderate Support': return 'risk-moderate';
        default: return 'risk-low';
      }
    };

    return (
      <div className="glass-card child-card" onClick={() => onClick(child)}>
        <div className="child-header">
          <h3 className="child-name">{child.name}</h3>
          <span className="child-age">Age: {child.age}</span>
        </div>
        
        <div className="child-scores">
          <div className="score-item">
            <p className="score-label">Memory</p>
            <p className="score-value">{child.games.kittenMatching.score}</p>
          </div>
          <div className="score-item">
            <p className="score-label">Math</p>
            <p className="score-value">{child.games.spaceMath.score}</p>
          </div>
          <div className="score-item">
            <p className="score-label">Attention</p>
            <p className="score-value">{child.games.bubblePop.score}</p>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{child.overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${child.overallProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className={`risk-badge ${getRiskClass(analysis.riskLevel)}`}>
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
        return value === 'Positive' ? 'metric-positive' : 
               value === 'Stable' ? 'metric-warning' : 'metric-danger';
      } else {
        return value === 'Low Support' ? 'metric-positive' :
               value === 'Moderate Support' ? 'metric-warning' : 'metric-danger';
      }
    };
    
    return (
      <div>
        <div className="analysis-header">
          <h2 className="analysis-title">{child.name} - Detailed Analysis</h2>
          <button className="back-button" onClick={onBack}>
            Back to Overview
          </button>
        </div>

        <div className="analysis-grid">
          <div className="glass-card chart-container">
            <h3 className="chart-title">Weekly Progress</h3>
            <div className="chart-wrapper">
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

          <div className="glass-card chart-container">
            <h3 className="chart-title">Cognitive Profile</h3>
            <div className="chart-wrapper">
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

        <div className="game-performance-grid">
          <div className="glass-card game-card">
            <h4 className="game-title">🐱 Kitten Matching</h4>
            <div className="game-stats">
              <div className="game-stat">
                <span>Score:</span>
                <span className="game-stat-value">{child.games.kittenMatching.score}</span>
              </div>
              <div className="game-stat">
                <span>Time:</span>
                <span>{child.games.kittenMatching.time}s</span>
              </div>
              <div className="game-stat">
                <span>Attempts:</span>
                <span>{child.games.kittenMatching.attempts}</span>
              </div>
              <div className="game-stat">
                <span>Improvement:</span>
                <span className="improvement-positive">+{child.games.kittenMatching.improvement}%</span>
              </div>
            </div>
          </div>

          <div className="glass-card game-card">
            <h4 className="game-title">🚀 Space Math</h4>
            <div className="game-stats">
              <div className="game-stat">
                <span>Score:</span>
                <span className="game-stat-value">{child.games.spaceMath.score}</span>
              </div>
              <div className="game-stat">
                <span>Time:</span>
                <span>{child.games.spaceMath.time}s</span>
              </div>
              <div className="game-stat">
                <span>Attempts:</span>
                <span>{child.games.spaceMath.attempts}</span>
              </div>
              <div className="game-stat">
                <span>Improvement:</span>
                <span className="improvement-positive">+{child.games.spaceMath.improvement}%</span>
              </div>
            </div>
          </div>

          <div className="glass-card game-card">
            <h4 className="game-title">🫧 Bubble Pop</h4>
            <div className="game-stats">
              <div className="game-stat">
                <span>Score:</span>
                <span className="game-stat-value">{child.games.bubblePop.score}</span>
              </div>
              <div className="game-stat">
                <span>Time:</span>
                <span>{child.games.bubblePop.time}s</span>
              </div>
              <div className="game-stat">
                <span>Attempts:</span>
                <span>{child.games.bubblePop.attempts}</span>
              </div>
              <div className="game-stat">
                <span>Improvement:</span>
                <span className="improvement-positive">+{child.games.bubblePop.improvement}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card analysis-summary">
          <h3 className="summary-title">Cognitive Analysis & Recommendations</h3>
          <div className="summary-section">
            <h4>Cognitive Profile:</h4>
            <p>{analysis.cognitiveProfile}</p>
          </div>
          
          <div className="summary-section">
            <h4>Strengths:</h4>
            <div className="tags-container">
              {child.strengths.map((strength, index) => (
                <span key={index} className="tag tag-strength">
                  {strength}
                </span>
              ))}
            </div>
          </div>
          
          <div className="summary-section">
            <h4>Areas for Development:</h4>
            <div className="tags-container">
              {child.challenges.map((challenge, index) => (
                <span key={index} className="tag tag-challenge">
                  {challenge}
                </span>
              ))}
            </div>
          </div>
          
          <div className="summary-section">
            <h4>Therapeutic Recommendations:</h4>
            <p>{analysis.recommendations}</p>
          </div>
          
          <div className="summary-metrics">
            <div className="metric-item">
              <p className="metric-label">Progress Trend</p>
              <span className={`metric-value ${getMetricClass(analysis.progressTrend, 'trend')}`}>
                {analysis.progressTrend}
              </span>
            </div>
            <div className="metric-item">
              <p className="metric-label">Support Level</p>
              <span className={`metric-value ${getMetricClass(analysis.riskLevel, 'risk')}`}>
                {analysis.riskLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedChild) {
    return (
      <div className="dashboard-container">
        <div className="main-content">
          <DetailedAnalysis child={selectedChild} onBack={() => setSelectedChild(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Dyslexia Therapy Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Comprehensive cognitive assessment and progress tracking for dyslexic children
          </p>
        </div>

        <div className="stats-grid">
          <StatCard 
            title="Total Children"
            value={childrenData.length}
            icon={Users}
            trend={2}
            colorClass="icon-blue"
          />
          <StatCard 
            title="Average Progress"
            value={`${Math.round(childrenData.reduce((acc, child) => acc + child.overallProgress, 0) / childrenData.length)}%`}
            icon={TrendingUp}
            trend={8}
            colorClass="icon-green"
          />
          <StatCard 
            title="Active Sessions"
            value="24"
            icon={Activity}
            trend={12}
            colorClass="icon-purple"
          />
          <StatCard 
            title="Avg Improvement"
            value={`${Math.round(childrenData.reduce((acc, child) => {
              const avgImp = (child.games.kittenMatching.improvement + child.games.spaceMath.improvement + child.games.bubblePop.improvement) / 3;
              return acc + avgImp;
            }, 0) / childrenData.length)}%`}
            icon={Award}
            trend={5}
            colorClass="icon-orange"
          />
        </div>

        <div>
          <h2 className="section-header">Children Overview</h2>
          <div className="children-grid">
            {childrenData.map((child) => (
              <ChildCard 
                key={child.id} 
                child={child} 
                onClick={setSelectedChild}
              />
            ))}
          </div>
        </div>

        <div className="analytics-grid">
          <div className="glass-card chart-container">
            <h3 className="chart-title">Game Performance Comparison</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={childrenData.map(child => ({
                  name: child.name.split(' ')[0],
                  Memory: child.games.kittenMatching.score,
                  Math: child.games.spaceMath.score,
                  Attention: child.games.bubblePop.score
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
                  <Bar dataKey="Math" fill="#82ca9d" />
                  <Bar dataKey="Attention" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-container">
            <h3 className="chart-title">Support Level Distribution</h3>
            <div className="chart-wrapper">
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

        <div className="dashboard-footer">
          <p className="footer-text">
            Dashboard updates automatically • Click on any child for detailed analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;