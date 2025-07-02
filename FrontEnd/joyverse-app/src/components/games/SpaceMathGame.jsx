import React, { useState, useEffect } from 'react';
import { Star, Rocket, Sparkles } from 'lucide-react';
import gameScoreService from '../../services/gameScoreAPI';
import emotionDetectionService from '../../services/emotionAPI';
import { getThemeForEmotion, emotionThemes } from '../../utils/emotionThemes';

const SpaceMathGame = ({ onClose, user }) => {
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [stars, setStars] = useState([]);
  
  // Emotion detection states
  const [currentEmotion, setCurrentEmotion] = useState('happiness');
  const [emotionTheme, setEmotionTheme] = useState(getThemeForEmotion('happiness'));
  const [isEmotionDetectionActive, setIsEmotionDetectionActive] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);

  // Planet themes and facts with emotion mapping
  const planets = [
    {
      name: "Mercury",
      emoji: "☿️",
      emotion: "neutral",
      colors: {
        primary: '#374151',
        secondary: '#d97706',
        accent: '#f97316',
        text: '#f3f4f6'
      },
      fact: "Mercury is the smallest planet and closest to the Sun. A day on Mercury lasts 59 Earth days! Perfect for staying focused and balanced."
    },
    {
      name: "Venus",
      emoji: "♀️",
      emotion: "anger",
      colors: {
        primary: '#ea580c',
        secondary: '#dc2626',
        accent: '#fb7185',
        text: '#fed7aa'
      },
      fact: "Venus is the hottest planet with temperatures reaching 900°F! When you feel angry, remember that cooling down like Venus's clouds is important."
    },
    {
      name: "Earth",
      emoji: "🌍",
      emotion: "happy",
      colors: {
        primary: '#2563eb',
        secondary: '#059669',
        accent: '#34d399',
        text: '#dbeafe'
      },
      fact: "Earth is the only known planet with life! 71% of Earth's surface is covered by water. Just like happiness, Earth is full of life and joy!"
    },
    {
      name: "Mars",
      emoji: "♂️",
      emotion: "surprise",
      colors: {
        primary: '#991b1b',
        secondary: '#dc2626',
        accent: '#f87171',
        text: '#fecaca'
      },
      fact: "Mars is called the Red Planet because of iron oxide (rust) on its surface. Full of surprises like the largest volcano in our solar system!"
    },
    {
      name: "Jupiter",
      emoji: "♃",
      emotion: "fear",
      colors: {
        primary: '#a16207',
        secondary: '#b91c1c',
        accent: '#fbbf24',
        text: '#fef3c7'
      },
      fact: "Jupiter is the largest planet! Its Great Red Spot storm has been raging for hundreds of years, but it protects us from asteroids like a gentle giant."
    },
    {
      name: "Saturn",
      emoji: "♄",
      emotion: "sad",
      colors: {
        primary: '#d97706',
        secondary: '#a16207',
        accent: '#fcd34d',
        text: '#fef3c7'
      },
      fact: "Saturn has beautiful rings made of ice and rock! Even when feeling down, remember that like Saturn's rings, there's always beauty around us."
    },
    {
      name: "Uranus",
      emoji: "♅",
      emotion: "sadness",
      colors: {
        primary: '#0891b2',
        secondary: '#0d9488',
        accent: '#22d3ee',
        text: '#cffafe'
      },
      fact: "Uranus rotates on its side and is the coldest planet. Sometimes we feel blue, but remember that even cold planets have their unique beauty."
    },
    {
      name: "Neptune",
      emoji: "♆",
      emotion: "sad",
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#60a5fa',
        text: '#dbeafe'
      },
      fact: "Neptune has the strongest winds in the solar system, reaching speeds of 1,200 mph! Even in sadness, there's power and beauty."
    }
  ];

  // Emotion to planet mapping
  const getEmotionPlanet = (emotion) => {
    const normalizedEmotion = emotion?.toLowerCase() || 'neutral';
    const planetIndex = planets.findIndex(planet => planet.emotion === normalizedEmotion);
    return planetIndex !== -1 ? planetIndex : 0; // Default to Mercury if emotion not found
  };

  const currentTheme = planets[currentPlanet];

  // Initialize emotion detection when game starts
  useEffect(() => {
    if (gameStarted && !isEmotionDetectionActive) {
      initializeEmotionDetection();
    }
    
    // Cleanup when game ends or component unmounts
    return () => {
      if (isEmotionDetectionActive) {
        console.log('🧹 Cleaning up emotion detection for Space Math Game');
        emotionDetectionService.stopEmotionDetection();
        setIsEmotionDetectionActive(false);
      }
    };
  }, [gameStarted, isEmotionDetectionActive]);

  // Additional cleanup when game state changes
  useEffect(() => {
    if (gameOver || !gameStarted) {
      if (isEmotionDetectionActive) {
        console.log('🎮 Game ended, stopping emotion detection');
        emotionDetectionService.stopEmotionDetection();
        setIsEmotionDetectionActive(false);
      }
    }
  }, [gameOver, gameStarted, isEmotionDetectionActive]);

  // Initialize emotion detection
  const initializeEmotionDetection = async () => {
    try {
      console.log('🎯 Initializing emotion detection...');
      
      // Enable camera preview for debugging
      const success = await emotionDetectionService.startEmotionDetection(handleEmotionDetected, true);
      if (success) {
        setIsEmotionDetectionActive(true);
        console.log('✅ Emotion detection initialized successfully for Space Math Game');
      } else {
        console.error('❌ Failed to start emotion detection - success = false');
      }
    } catch (error) {
      console.error('❌ Failed to initialize emotion detection:', error);
    }
  };

  // Handle emotion detection results
  const handleEmotionDetected = (emotionData) => {
    const { emotion, confidence, history } = emotionData;
    
    console.log(`🎭 Emotion detected: ${emotion} (${Math.round(confidence * 100)}%)`);
    
    setCurrentEmotion(emotion);
    setEmotionHistory(history);
    
    // Update theme based on emotion
    const newTheme = getThemeForEmotion(emotion);
    setEmotionTheme(newTheme);
    
    // Change planet based on emotion
    const newPlanetIndex = getEmotionPlanet(emotion);
    if (newPlanetIndex !== currentPlanet) {
      setCurrentPlanet(newPlanetIndex);
      console.log(`🪐 Planet changed to ${planets[newPlanetIndex].name} based on emotion: ${emotion}`);
      
      // Show planet change feedback
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    
    // Show emotion feedback briefly
    setShowEmotionFeedback(true);
    setTimeout(() => setShowEmotionFeedback(false), 3000);
  };

  // Generate stars for background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 20; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Generate math problem based on level
  const generateProblem = () => {
    let num1, num2, operation, answer;
    
    if (currentLevel <= 2) {
      // Addition and subtraction (1-10)
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = Math.random() < 0.5 ? '+' : '-';
      if (operation === '-' && num2 > num1) {
        [num1, num2] = [num2, num1]; // Ensure positive result
      }
      answer = operation === '+' ? num1 + num2 : num1 - num2;
    } else if (currentLevel <= 4) {
      // Multiplication (1-10)
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = '×';
      answer = num1 * num2;
    } else {
      // Division
      answer = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      num1 = answer * num2;
      operation = '÷';
    }

    return {
      question: `${num1} ${operation} ${num2}`,
      answer: answer
    };
  };

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCurrentLevel(1);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setTimeLeft(60);
    setCurrentPlanet(getEmotionPlanet('happy')); // Start with Earth (happy)
    setCurrentProblem(generateProblem());
    setFeedback('');
    setUserAnswer('');
  };

  // Handle answer submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) return;

    setTotalQuestions(prev => prev + 1);

    if (answer === currentProblem.answer) {
      setScore(prev => prev + currentLevel * 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedback('🚀 Correct! Great job!');
      
      // Level up every 5 correct answers (but planet changes are emotion-based now)
      if ((correctAnswers + 1) % 5 === 0 && currentLevel < 8) {
        setCurrentLevel(prev => prev + 1);
        setFeedback(`🌟 Level Up! You're doing amazing on ${planets[currentPlanet].name}!`);
      }
    } else {
      setFeedback(`❌ Not quite! The answer was ${currentProblem.answer}`);
    }

    setQuestionsAnswered(prev => prev + 1);
    setUserAnswer('');
    
    // Generate new problem after a short delay
    setTimeout(() => {
      if (timeLeft > 0) {
        setCurrentProblem(generateProblem());
        setFeedback('');
      }
    }, 1500);
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, gameOver, timeLeft]);

  // End game
  const endGame = async () => {
    setGameOver(true);
    setGameStarted(false);
    
    // Save score to API
    if (user) {
      try {
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        await gameScoreService.saveScore({
          userId: user.userId,
          gameName: 'Space Math Adventure',
          score: score,
          accuracy: Math.round(accuracy),
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log('🔌 Testing API connection...');
      const response = await fetch('http://localhost:8001/test');
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Connection successful:', result);
        alert('✅ API is working! ' + result.message);
      } else {
        console.error('❌ API connection failed:', response.status);
        alert('❌ API connection failed. Is your FastAPI server running on port 8001?');
      }
    } catch (error) {
      console.error('❌ API connection error:', error);
      alert('❌ Cannot connect to API. Make sure your FastAPI server is running!');
    }
  };

  // Test camera access
  const testCameraAccess = async () => {
    try {
      console.log('📷 Testing camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('✅ Camera access granted');
      alert('✅ Camera access is working!');
      
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('❌ Camera access error:', error);
      alert('❌ Camera access failed: ' + error.message);
    }
  };

  // Test emotion detection manually
  const testEmotionDetection = async () => {
    try {
      console.log('🎭 Testing emotion detection manually...');
      
      if (isEmotionDetectionActive) {
        console.log('⚠️ Emotion detection is already active, stopping first...');
        emotionDetectionService.stopEmotionDetection();
        setIsEmotionDetectionActive(false);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }
      
      console.log('🚀 Starting emotion detection...');
      const success = await emotionDetectionService.startEmotionDetection(handleEmotionDetected, true);
      
      if (success) {
        setIsEmotionDetectionActive(true);
        alert('✅ Emotion detection started successfully!');
        console.log('✅ Emotion detection test successful');
      } else {
        alert('❌ Emotion detection failed to start');
        console.error('❌ Emotion detection failed to start');
      }
    } catch (error) {
      console.error('❌ Emotion detection test error:', error);
      alert('❌ Emotion detection test failed: ' + error.message);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 50%, ${currentTheme.colors.accent} 100%)`,
      color: currentTheme.colors.text,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Comic Sans MS", "Trebuchet MS", cursive',
      margin: 0,
      padding: 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }} className="emotion-theme-transition">
      {/* Floating Back Button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Emotion Detection Status */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: isEmotionDetectionActive ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isEmotionDetectionActive ? '#4CAF50' : '#f44336',
          animation: isEmotionDetectionActive ? 'pulse 2s infinite' : 'none'
        }}></div>
        {isEmotionDetectionActive ? '🎭 Emotion Detection Active' : '😐 Emotion Detection Inactive'}
      </div>
      {/* Animated Stars Background */}
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: currentTheme.colors.text,
            borderRadius: '50%',
            opacity: star.opacity * 0.6,
            animation: `twinkle ${2 + Math.random() * 3}s infinite`,
            boxShadow: `0 0 6px ${currentTheme.colors.accent}`
          }}
        />
      ))}

      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', 
        zIndex: 1,
        padding: '20px',
        boxSizing: 'border-box',
        maxWidth: '1200px',
        margin: '0 auto',
        overflow: 'hidden',
        color: currentTheme.colors.text
      }}>

        
        {/* Header with Planet Info */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '3rem',
              background: `linear-gradient(45deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255, 255, 255, 0.3)'
            }}>
              {currentTheme.emoji}
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                margin: 0,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
              }}>
                🚀 Space Math Adventure
              </h1>
              <h2 style={{ 
                fontSize: '1.2rem', 
                margin: '0.5rem 0 0 0',
                color: currentTheme.colors.accent
              }}>
                Exploring {currentTheme.name}
              </h2>
            </div>
          </div>
          
          {/* Planet Fact */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '1rem',
            fontSize: '1rem',
            fontStyle: 'italic',
            borderLeft: `4px solid ${currentTheme.colors.accent}`
          }}>
            💫 {currentTheme.fact}
          </div>

          {/* Planet Selector - Hidden for now */}
          {false && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                marginBottom: '0.5rem', 
                textAlign: 'center',
                color: currentTheme.colors.accent
              }}>
                🌌 Emotion-Guided Space Travel
              </h3>
              <p style={{
                fontSize: '0.9rem',
                textAlign: 'center',
                opacity: 0.9,
                marginBottom: '1rem',
                fontStyle: 'italic'
              }}>
                Your emotions guide which planet you visit! Each feeling takes you to a different world.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '0.5rem',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                {planets.map((planet, index) => (
                  <div
                    key={index}
                    style={{
                      background: currentPlanet === index 
                        ? `linear-gradient(45deg, ${planet.colors.primary}, ${planet.colors.accent})`
                        : 'rgba(255, 255, 255, 0.1)',
                      border: currentPlanet === index 
                        ? `3px solid ${planet.colors.accent}`
                        : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '0.8rem 0.5rem',
                      transition: 'all 0.3s ease',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                      opacity: currentPlanet === index ? 1 : 0.7,
                      transform: currentPlanet === index ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentPlanet === index ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{planet.emoji}</div>
                    <div style={{ fontSize: '0.7rem' }}>{planet.name}</div>
                    <div style={{ 
                      fontSize: '0.6rem', 
                      opacity: 0.8,
                      textTransform: 'capitalize',
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '0.2rem 0.4rem',
                      borderRadius: '8px',
                      marginTop: '0.2rem'
                    }}>
                      {planet.emotion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Game Stats */}
        {gameStarted && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            marginBottom: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentLevel}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Level</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{timeLeft}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Time</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{correctAnswers}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Correct</div>
            </div>
          </div>
        )}

        {/* Level Up Animation */}
        {showLevelUp && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `linear-gradient(45deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
            color: 'white',
            padding: '2rem',
            borderRadius: '20px',
            textAlign: 'center',
            zIndex: 1000,
            animation: 'levelUp 3s ease-out',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{currentTheme.emoji}</div>
            Welcome to {currentTheme.name}!
          </div>
        )}

        {!gameStarted && !gameOver && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '25px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                Welcome to Space Math Adventure!
              </h2>
              <p style={{ fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Solve math problems to navigate through space! Your emotions will guide you to different planets 
                in our solar system. Each planet offers unique challenges and beautiful scenery that matches your mood!
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={startGame}
                  style={{
                    background: `linear-gradient(45deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '0.8rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  🚀 Start Space Journey
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button
                  onClick={testAPIConnection}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                    padding: '0.6rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  🔌 Test API
                </button>
                <button
                  onClick={testCameraAccess}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                    padding: '0.6rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  📷 Test Camera
                </button>
                <button
                  onClick={testEmotionDetection}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                    padding: '0.6rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  🎭 Test Emotions
                </button>
              </div>
            </div>
          </div>
        )}

        {gameStarted && currentProblem && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '25px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                Solve this problem to continue your space journey:
              </h3>
              <div style={{
                fontSize: '2.2rem',
                fontWeight: 'bold',
                marginBottom: '2rem',
                color: currentTheme.colors.accent
              }}>
                {currentProblem.question} = ?
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  style={{
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    background: 'white',
                    color: '#333',
                    borderRadius: '15px',
                    padding: '0.8rem',
                    width: '180px',
                    fontWeight: 'bold',
                    border: 'none',
                    outline: 'none'
                  }}
                  placeholder="?"
                  autoFocus
                />
                <button
                  type="submit"
                  style={{
                    background: `linear-gradient(45deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '0.8rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  Submit Answer 🚀
                </button>
              </form>
            </div>
            {feedback && (
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                animation: 'bounce 1s infinite',
                color: currentTheme.colors.accent
              }}>
                {feedback}
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '25px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                🏆 Mission Complete!
              </h2>
              <div style={{ fontSize: '1rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  Final Score: <span style={{ color: currentTheme.colors.accent, fontWeight: 'bold' }}>{score}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>Questions Answered: {totalQuestions}</div>
                <div style={{ marginBottom: '0.5rem' }}>Correct Answers: {correctAnswers}</div>
                <div style={{ marginBottom: '0.5rem' }}>
                  Accuracy: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </div>
                <div>Highest Level Reached: {currentLevel}</div>
                <div>Final Planet: {currentTheme.name} ({planets[currentPlanet].emotion})</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={startGame}
                  style={{
                    background: `linear-gradient(45deg, ${currentTheme.colors.accent}, ${currentTheme.colors.primary})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🚀 Play Again
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Emotion Controls - Removed */}

      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes levelUp {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
          40%, 43% { transform: translate3d(0, -10px, 0); }
          70% { transform: translate3d(0, -5px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }

        @keyframes emotionFeedback {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SpaceMathGame;
