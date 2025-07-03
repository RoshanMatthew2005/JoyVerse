import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Gamepad2, Zap, CloudSnow, Camera } from 'lucide-react';
import gameScoreService from '../../services/gameScoreAPI';
import Webcam from 'react-webcam';
import axios from 'axios';

const KittenMatchGame = ({ onClose, user }) => {
  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, preview, playing, complete
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [canFlip, setCanFlip] = useState(true);
  const [previewTime, setPreviewTime] = useState(3);  
  const [showingPreview, setShowingPreview] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [encouragingMessage, setEncouragingMessage] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1-minute timer
  
  // Webcam and emotion state
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionBackground, setEmotionBackground] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);
  const captureDelay = 5000; // Capture every 5 seconds

  // Game themes with enhanced colors and emojis
  const themes = [
    {
      name: '🐱 Cute Kittens',
      emojis: ['🐱', '😸', '😺', '😻', '😽', '🙀', '😿', '😾'],
      colors: {
        primary: '#ff6b6b',
        secondary: '#ff8e8e',
        front: '#74b9ff',
        frontSecondary: '#0984e3'
      },
      background: 'linear-gradient(-45deg, #ff9a9e, #fecfef, #fecfef, #ffecd2)'
    },
    {
      name: '🌊 Ocean Friends',
      emojis: ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🐚', '🦀'],
      colors: {
        primary: '#00b894',
        secondary: '#00cec9',
        front: '#0984e3',
        frontSecondary: '#74b9ff'
      },
      background: 'linear-gradient(-45deg, #a8edea, #fed6e3, #d3e0dc, #a8e6cf)'
    },
    {
      name: '🚀 Space Adventure',
      emojis: ['🚀', '🛸', '👽', '🌟', '🌙', '⭐', '🌍', '🛰️'],
      colors: {
        primary: '#6c5ce7',
        secondary: '#a29bfe',
        front: '#fd79a8',
        frontSecondary: '#fdcb6e'
      },
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)'
    },
    {
      name: '🦄 Magical Unicorns',
      emojis: ['🦄', '🌈', '✨', '⭐', '�', '🎀', '�', '🎪'],
      colors: {
        primary: '#fd79a8',
        secondary: '#fdcb6e',
        front: '#6c5ce7',
        frontSecondary: '#00cec9'
      },
      background: 'linear-gradient(-45deg, #ff9a9e, #fecfef, #ffecd2, #fcb69f)'
    },
    {
      name: '🌳 Forest Animals',
      emojis: ['�', '🦝', '🦊', '�', '�', '�️', '🦔', '�'],
      colors: {
        primary: '#00b894',
        secondary: '#55a3ff',
        front: '#fdcb6e',
        frontSecondary: '#fd79a8'
      },
      background: 'linear-gradient(-45deg, #a8e6cf, #dcedc1, #ffd3a5, #fd9853)'
    },
    {
      name: '🍎 Yummy Food',
      emojis: ['🍎', '🍌', '🍓', '🍊', '🍇', '🥕', '🍒', '🥝'],
      colors: {
        primary: '#e17055',
        secondary: '#fdcb6e',
        front: '#00b894',
        frontSecondary: '#0984e3'
      },
      background: 'linear-gradient(-45deg, #ffecd2, #fcb69f, #ff9a9e, #fecfef)'
    },
    {
      name: 'Jungle Safari',
      emojis: ['🦁', '🐯', '🐘', '🦒', '🦓', '🐆', '🦏', '🐊'],
      colors: {
        primary: '#e17055',
        secondary: '#d63031',
        front: '#00b894',
        frontSecondary: '#00cec9'
      }
    }
  ];

  // Emotion to background color/gradient mapping
  const emotionColors = {
    happiness: 'linear-gradient(-45deg, #ff9a9e, #fecfef, #fad0c4, #ffd1ff)', // Warm, happy colors
    sadness: 'linear-gradient(-45deg, #a1c4fd, #c2e9fb, #6a85b6, #bac8e0)',   // Cool, blue colors
    anger: 'linear-gradient(-45deg, #ff416c, #ff4b2b, #f78ca0, #fe9a8b)',     // Red, intense colors
    fear: 'linear-gradient(-45deg, #4b6cb7, #182848, #2c3e50, #4b6cb7)',      // Dark, deep colors
    surprise: 'linear-gradient(-45deg, #faaca8, #ddd6f3, #f3e7e9, #e3eeff)',  // Vibrant, bright colors
    neutral: null // Use theme default
  };

  const currentThemeData = themes[currentTheme];
  const kittenTypes = currentThemeData.emojis;

  // Encouraging messages for correct matches
  const encouragingWords = [
    "🎉 Great job!",
    "🌟 Awesome match!",
    "💫 Fantastic!",
    "🎊 Well done!",
    "✨ Perfect!",
    "🏆 Excellent!",
    "🎈 Amazing!",
    "🌈 Wonderful!",
    "🎯 Bull's eye!",
    "⭐ Superb!",
    "🎪 Marvelous!",
    "🎭 Brilliant!",
    "🎨 Creative!",
    "🎵 Harmonious!",
    "🎸 Rock on!",
    "🎺 Spectacular!",
    "🎯 On target!",
    "🌸 Beautiful!",
    "🦋 Graceful!",
    "🌺 Lovely!"
  ];

  const showEncouragingMessage = () => {
    const randomMessage = encouragingWords[Math.floor(Math.random() * encouragingWords.length)];
    setEncouragingMessage(randomMessage);
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 2000);
  };

  // Emotion detection setup
  const detectEmotion = useCallback(async (imageSrc) => {
    try {
      const response = await axios.post('https://your-emotion-detection-api.com/detect', {
        image: imageSrc
      });
      
      if (response.data && response.data.emotion) {
        setEmotion(response.data.emotion);
        setEmotionConfidence(response.data.confidence);
        
        // Change background based on emotion
        if (response.data.emotion === 'happy') {
          setEmotionBackground('linear-gradient(-45deg, #81fbb8, #28c76f)');
        } else if (response.data.emotion === 'sad') {
          setEmotionBackground('linear-gradient(-45deg, #fbc2eb, #a6c1ee)');
        } else if (response.data.emotion === 'angry') {
          setEmotionBackground('linear-gradient(-45deg, #ff758c, #ff7eb3)');
        } else {
          setEmotionBackground(null);
        }
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
    }
  }, []);

  // Webcam capture and emotion detection
  useEffect(() => {
    const captureImage = async () => {
      if (webcamRef.current && isCapturing) {
        const imageSrc = webcamRef.current.getScreenshot();
        
        if (imageSrc) {
          detectEmotion(imageSrc);
        }
      }
    };

    // Start capturing at intervals
    if (isCapturing) {
      captureImage();
      const interval = setInterval(captureImage, captureDelay);
      setCaptureInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [isCapturing, detectEmotion, captureDelay]);

  // Webcam and emotion detection functions
  const captureImage = async () => {
    if (!webcamRef.current || !webcamRef.current.video || !webcamRef.current.video.readyState === 4) {
      console.log('Webcam not ready yet');
      return;
    }

    // Check if enough time has passed since last capture
    const now = Date.now();
    if (now - lastCaptureTime < captureDelay) {
      return; // Skip this capture, not enough time has passed
    }
    
    setLastCaptureTime(now);
    setIsCapturing(true);

    try {
      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      // Send to emotion API
      const formData = new FormData();
      formData.append('file', blob, 'webcam.jpg');

      const response = await axios.post('http://localhost:8001/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update emotion state
      console.log('Emotion prediction:', response.data);
      setEmotion(response.data.emotion);
      setEmotionConfidence(response.data.confidence);
      
      // Update background based on emotion
      setEmotionBackground(emotionColors[response.data.emotion]);
    } catch (error) {
      console.error('Error capturing or analyzing image:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam(prev => !prev);
    if (!showWebcam) {
      // Start capturing when webcam is shown
      const interval = setInterval(captureImage, 5000); // Capture every 5 seconds
      setCaptureInterval(interval);
    } else {
      // Stop capturing when webcam is hidden
      if (captureInterval) {
        clearInterval(captureInterval);
        setCaptureInterval(null);
      }
    }
  };

  // Clean up webcam interval on component unmount
  useEffect(() => {
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [captureInterval]);

  // Game functions
  const handleCardClick = (card) => {
    if (!canFlip || card.flipped || card.matched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);
    
    const newCards = cards.map(c => 
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setCanFlip(false);
      
      if (newFlippedCards[0].emoji === newFlippedCards[1].emoji) {
        // Show encouraging message for correct match
        showEncouragingMessage();
        
        setTimeout(() => {
          const matchedIds = newFlippedCards.map(c => c.id);          setMatchedCards(prev => {
            const newMatched = [...prev, ...matchedIds];
            if (newMatched.length === cards.length) {
              console.log('🎉 KittenMatch: Game completed! All pairs matched.');
              const endTime = Date.now();
              setGameEndTime(endTime);
              
              // Save game score
              const timeTaken = gameStartTime ? Math.round((endTime - gameStartTime) / 1000) : 0;
              const gameData = {
                score: score + 100 + (combo * 10),
                maxScore: (cards.length / 2) * 100 + (cards.length / 2 * 10), // Max possible score
                timeTaken,
                level,
                matchesFound: newMatched.length / 2,
                totalPairs: cards.length / 2,
                difficulty: currentThemeData.name
              };
              
              console.log('💾 KittenMatch: About to save game data:', gameData);
              saveGameScore(gameData);
              setTimeout(() => setGameState('complete'), 500);
            }
            return newMatched;
          });
          setCards(prev => prev.map(c => 
            matchedIds.includes(c.id) ? { ...c, matched: true } : c
          ));
          setScore(prev => prev + 100 + (combo * 10));
          setCombo(prev => prev + 1);
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.some(fc => fc.id === c.id) ? { ...c, flipped: false } : c
          ));
          setFlippedCards([]);
          setCanFlip(true);
          setCombo(0);
        }, 1500);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setLevel(1);
    setGameState('preview');
    setShowingPreview(true);
    setPreviewTime(3);
    setTimeLeft(60); // Reset timer to 1 minute
    generateCards(1);
    
    const previewTimer = setInterval(() => {
      setPreviewTime(prev => {
        if (prev <= 1) {
          clearInterval(previewTimer);
          setShowingPreview(false);
          setGameState('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const generateCards = (gameLevel) => {
    let id = 0;
    const pairsToUse = Math.min(3 + gameLevel, 8);
    const selectedEmojis = kittenTypes.slice(0, pairsToUse);
    const newCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map(emoji => ({
        id: id++,
        emoji,
        flipped: false,
        matched: false
      }));
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setCanFlip(true);
    setGameStartTime(Date.now()); // Start timing when cards are generated
  };  // Save game score to database
  const saveGameScore = async (gameData) => {
    try {
      console.log('🐱 KittenMatch: saveGameScore function called!');
      console.log('🐱 KittenMatch: Saving game score with data:', gameData);
      console.log('🐱 KittenMatch: Current localStorage token:', localStorage.getItem('joyverse_token') ? 'EXISTS' : 'MISSING');
      
      const formattedData = gameScoreService.formatGameData('kitten-match', gameData);
      console.log('📝 KittenMatch: Formatted data:', formattedData);
      
      const result = await gameScoreService.saveGameScore(formattedData);
      console.log('✅ KittenMatch: Game score saved successfully:', result);
    } catch (error) {
      console.error('❌ KittenMatch: Failed to save game score:', error);
      // Don't show error to user, just log it
    }
  };

  const handleNextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setGameState('preview');
    setShowingPreview(true);
    setPreviewTime(3);
    generateCards(newLevel);
    
    // Rotate theme every few levels
    if (newLevel % 3 === 0) {
      setCurrentTheme(prev => (prev + 1) % themes.length);
    }
    
    const previewTimer = setInterval(() => {
      setPreviewTime(prev => {
        if (prev <= 1) {
          clearInterval(previewTimer);
          setShowingPreview(false);
          setGameState('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Timer effect
  useEffect(() => {
    let timerInterval;
    
    // Only run timer during gameplay
    if (gameState === 'playing') {
      timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            // End game when timer reaches 0
            if (matchedCards.length < cards.length) {
              const endTime = Date.now();
              setGameEndTime(endTime);
              setGameState('complete');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameState, matchedCards.length, cards.length]);

  // Cleanup effect
  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      console.log('🧹 Cleaning up Kitten Match Game');
    };
  }, [gameState]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: emotionBackground || currentThemeData.background || `linear-gradient(-45deg, ${currentThemeData.colors.primary}40, ${currentThemeData.colors.secondary}40, ${currentThemeData.colors.frontSecondary}40, ${currentThemeData.colors.front}20)`,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      transition: 'background 0.8s ease-in-out',
      overflow: 'hidden',
      fontFamily: '"Comic Sans MS", "Trebuchet MS", cursive',
      zIndex: 0
    }}>
      {/* Floating Back Button */}
      <button
        onClick={onClose}
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

      {/* Game Score - Centered at Top */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '25px',
          padding: '10px 25px',
          fontSize: '16px',
          fontWeight: '700',
          color: '#333',
          zIndex: 1001,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <span>🐱 Level {level}</span>
          <span style={{ borderLeft: '2px solid rgba(0,0,0,0.1)', paddingLeft: '15px' }}>⭐ Score: {score}</span>
          <span style={{ borderLeft: '2px solid rgba(0,0,0,0.1)', paddingLeft: '15px' }}>🔥 Combo: {combo}</span>
        </div>
      )}

      {/* Theme Status */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '25px',
        padding: '10px 18px',
        fontSize: '15px',
        color: '#333',
        zIndex: 1001,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
      }}>
        {currentThemeData.name}
      </div>

      {/* Webcam Toggle Button */}
      {gameState === 'playing' && (
        <button
          onClick={toggleWebcam}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: showWebcam ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px',
            fontSize: '16px',
            color: '#333',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
          }}
          title={showWebcam ? "Hide webcam" : "Show webcam (for emotion detection)"}
        >
          <Camera size={24} />
        </button>
      )}
      
      {/* Webcam Component */}
      {showWebcam && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          width: '200px',
          height: '150px',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          zIndex: 1001
        }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            width={200}
            height={150}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 200,
              height: 150,
              facingMode: "user"
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {isCapturing && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: 'red',
                animation: 'pulse 1s infinite' 
              }}></div>
            </div>
          )}
        </div>
      )}
      
      {/* Emotion Indicator */}
      {showWebcam && emotion && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '230px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '15px',
          padding: '10px 15px',
          fontSize: '14px',
          color: '#333',
          zIndex: 1001,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px'
        }}>
          <div style={{ fontWeight: 'bold' }}>Detected Emotion:</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            {emotion === 'happiness' && '😊'}
            {emotion === 'sadness' && '😢'}
            {emotion === 'anger' && '😠'}
            {emotion === 'fear' && '😨'}
            {emotion === 'surprise' && '😲'}
            {emotion === 'neutral' && '😐'}
            <span style={{ textTransform: 'capitalize' }}>{emotion}</span>
            <span style={{ 
              fontSize: '12px', 
              opacity: 0.7 
            }}>
              {Math.round(emotionConfidence * 100)}%
            </span>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '80px',
        left: '0',
        width: '100%',
        height: 'calc(100% - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="game-menu">
            <div className="menu-content">
              <div className="game-title">
                <h1>🐱 Kitten Memory Match</h1>
                <p>Test your memory with cute animals!</p>
              </div>
              <div className="menu-actions">
                <button className="action-btn primary large" onClick={startGame}>
                  <Gamepad2 size={24} />
                  Start Game
                </button>
              </div>
              
              <div className="theme-selector">
                <h3>🎨 Choose Your Theme:</h3>
                <div className="theme-options">
                  {themes.map((theme, index) => (
                    <button
                      key={index}
                      className={`theme-btn ${currentTheme === index ? 'active' : ''}`}
                      onClick={() => setCurrentTheme(index)}
                      style={{
                        background: theme.background || `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        border: currentTheme === index ? `3px solid ${theme.colors.front}` : '2px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <span className="theme-emoji">{theme.emojis[0]}</span>
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Preview */}
        {gameState === 'preview' && showingPreview && (
          <div className="preview-overlay">
            <div className="preview-content">
              <h3>Memorize the {currentThemeData.name}!</h3>
              <div className="preview-animals">
                {kittenTypes.slice(0, Math.min(3 + level, 8)).map((animal, index) => (
                  <div key={index} className="preview-animal">
                    {animal}
                  </div>
                ))}
              </div>
              <p>Get ready! Starting in {previewTime} seconds...</p>
            </div>
          </div>
        )}

        {/* Game Board */}
        {gameState === 'playing' && (
          <>
            {/* Timer Display */}
            <div className="timer-display">
              <div className="timer-circle">
                <div className="timer-value">{timeLeft}</div>
              </div>
            </div>
            
            <div className="game-board" style={{ marginTop: '40px' }}>
              {cards.map(card => (
                <div 
                  key={card.id} 
                  className={`card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
                  onClick={() => handleCardClick(card)}
                  style={{ 
                    backgroundColor: card.flipped || card.matched ? 
                      currentThemeData.colors.front : currentThemeData.colors.secondary 
                  }}
                >
                  <div className="card-content">
                    {card.flipped || card.matched ? card.emoji : '?'}
                  </div>
                </div>
              ))}
            </div>

            {/* Encouraging Message */}
            {showEncouragement && (
              <div className="encouraging-message">
                {encouragingMessage}
              </div>
            )}
            
            <div className="game-actions">
              <button className="action-btn secondary" onClick={onClose}>
                <X size={16} />
                Give Up
              </button>
            </div>
          </>
        )}

        {/* Game Complete */}
        {gameState === 'complete' && (
          <div className="game-complete">
            <h3>🎉 Level {level} Complete!</h3>
            <div className="complete-stats">
              <p>Score: {score}</p>
              <p>Combo: {combo}</p>
              <p>Theme: {currentThemeData.name}</p>
            </div>
            <div className="complete-actions">
              <button className="action-btn primary" onClick={handleNextLevel}>
                <Zap size={16} />
                Next Level
              </button>
              <button className="action-btn secondary" onClick={() => setGameState('menu')}>
                Main Menu
              </button>
              <button className="action-btn secondary" onClick={onClose}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      {/* Game Styles */}
      <style jsx>{`
        .game-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(15px);
          border-radius: 0;
          padding: 1rem;
          margin: 0;
          width: 100vw;
          height: 100vh;
          overflow-y: auto;
          border: none;
          box-shadow: none;
          position: relative;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          color: ${currentThemeData.colors.primary};
        }

        .game-header h2 {
          font-size: 1.5rem;
          margin: 0;
          font-weight: 700;
        }

        .game-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .game-info {
          display: flex;
          gap: 1rem;
          font-size: 1rem;
          color: #333;
          font-weight: 600;
        }

        .close-game-btn {
          background: rgba(255, 107, 107, 0.2);
          border: 2px solid #ff6b6b;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff6b6b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-game-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          transform: scale(1.1);
        }

        .game-menu {
          text-align: center;
          padding: 2rem 0;
        }

        .game-title h1 {
          font-size: 2.5rem;
          color: ${currentThemeData.colors.primary};
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .game-title p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .menu-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .theme-selector {
          margin-top: 1rem;
          text-align: center;
        }

        .theme-selector h3 {
          color: ${currentThemeData.colors.primary};
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 1rem;
        }

        .theme-btn {
          padding: 12px 16px;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .theme-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .theme-btn.active {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .theme-emoji {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }

        .theme-name {
          font-size: 0.9rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 25px;
        }

        .preview-content {
          text-align: center;
          color: white;
        }

        .preview-content h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .preview-animals {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin: 1.5rem 0;
          flex-wrap: wrap;
        }

        .preview-animal {
          font-size: 3rem;
          animation: bounceIn 1s ease-out;
        }

        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes emotionPulse {
          0% { 
            transform: translate(-50%, -50%) scale(0.8); 
            opacity: 0; 
          }
          20% { 
            transform: translate(-50%, -50%) scale(1.2); 
            opacity: 1; 
          }
          40% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 0; 
          }
        }

        @keyframes themeIndicatorPulse {
          0% { 
            transform: translateX(-50%) scale(1); 
            opacity: 0.8; 
          }
          50% { 
            transform: translateX(-50%) scale(1.05); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(-50%) scale(1); 
            opacity: 0.8; 
          }
        }

        .game-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .timer-display {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .timer-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 2;
        }
        
        .timer-circle:before {
          content: '';
          position: absolute;
          width: 66px;
          height: 66px;
          border-radius: 50%;
          border: 3px solid #ff6b6b;
          border-top-color: transparent;
          animation: timerSpin 1s linear infinite;
        }
        
        .timer-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        
        @keyframes timerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .game-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
          perspective: 1000px;
        }
        
        .card {
          height: 100px;
          background-color: #ff8e8e;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2.5rem;
          cursor: pointer;
          transition: transform 0.6s, box-shadow 0.3s;
          transform-style: preserve-3d;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          transform: translateY(-5px);
        }
        
        .card.flipped {
          transform: rotateY(180deg);
        }
        
        .card:before, .card:after {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card:before {
          content: '?';
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
        }
        
        .card:after {
          content: attr(data-emoji);
          transform: rotateY(180deg);
        }
        
        .card.matched {
          opacity: 0.8;
          cursor: default;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1) rotateY(180deg); }
          50% { transform: scale(1.05) rotateY(180deg); }
          100% { transform: scale(1) rotateY(180deg); }
        }
        
        .encouraging-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 15px 30px;
          border-radius: 30px;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          z-index: 1000;
          animation: popIn 0.5s forwards;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
        }
        
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes pulse {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        .timer-display {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .timer-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 2;
        }
        
        .timer-circle:before {
          content: '';
          position: absolute;
          width: 66px;
          height: 66px;
          border-radius: 50%;
          border: 3px solid #ff6b6b;
          border-top-color: transparent;
          animation: timerSpin 1s linear infinite;
        }
        
        .timer-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        
        @keyframes timerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .game-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
          perspective: 1000px;
        }
        
        .card {
          height: 100px;
          background-color: #ff8e8e;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2.5rem;
          cursor: pointer;
          transition: transform 0.6s, box-shadow 0.3s;
          transform-style: preserve-3d;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          transform: translateY(-5px);
        }
        
        .card.flipped {
          transform: rotateY(180deg);
        }
        
        .card:before, .card:after {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card:before {
          content: '?';
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
        }
        
        .card:after {
          content: attr(data-emoji);
          transform: rotateY(180deg);
        }
        
        .card.matched {
          opacity: 0.8;
          cursor: default;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1) rotateY(180deg); }
          50% { transform: scale(1.05) rotateY(180deg); }
          100% { transform: scale(1) rotateY(180deg); }
        }
        
        .encouraging-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 15px 30px;
          border-radius: 30px;
          font-size: 24px;
          font-weight: bold;
          color: #333;
          z-index: 1000;
          animation: popIn 0.5s forwards;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
        }
        
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes pulse {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
      <style>{`
        @keyframes webcamPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .webcam-container {
          position: absolute;
          bottom: 80px;
          right: 20px;
          width: 200px;
          height: 150px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          animation: webcamPulse 2s infinite;
        }

        .webcam-container.hidden {
          display: none;
        }

        .webcam-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .webcam-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: red;
          animation: pulse 1s infinite;
        }
      `}</style>
      </div>
    </div>
  );
};

export default KittenMatchGame;