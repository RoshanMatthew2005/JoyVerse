import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SpaceMathGame from '../components/games/SpaceMathGame';
import emotionDetectionService from '../services/emotionAPI';

const SpaceMathGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGameClose = () => {
    // Ensure emotion detection is stopped when leaving the game
    console.log('🚪 Leaving Space Math Game, stopping emotion detection');
    emotionDetectionService.stopEmotionDetection();
    navigate('/child-dashboard');
  };

  // Cleanup on component unmount (browser back button, etc.)
  useEffect(() => {
    return () => {
      console.log('🧹 SpaceMathGamePage unmounting, stopping emotion detection');
      emotionDetectionService.stopEmotionDetection();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(-45deg, #2c2c54, #40407a, #706fd3, #f0932b)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      {/* Floating Back Button */}
      <button
        onClick={handleGameClose}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 1)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Game Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '25px',
        padding: '10px 20px',
        fontSize: '18px',
        fontWeight: '700',
        color: '#333',
        zIndex: 1001,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}>
        🚀 Space Math Quest
      </div>

      {/* Full Screen Game */}
      <SpaceMathGame 
        onClose={handleGameClose}
        user={user}
      />
    </div>
  );
};

export default SpaceMathGamePage;
