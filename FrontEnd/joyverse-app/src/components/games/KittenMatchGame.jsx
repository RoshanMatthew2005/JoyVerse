import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Gamepad2, Zap, CloudSnow } from 'lucide-react';
import gameScoreService from '../../services/gameScoreAPI';
import emotionDetectionService from '../../services/emotionAPI';
import { getThemeForEmotion, emotionThemes } from '../../utils/emotionThemes';

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
  const [previewTime, setPreviewTime] = useState(3);  const [showingPreview, setShowingPreview] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [encouragingMessage, setEncouragingMessage] = useState('');
  const [showEncouragement, setShowEncouragement] = useState(false);
  
  // Emotion detection states
  const [currentEmotion, setCurrentEmotion] = useState('happiness');
  const [emotionTheme, setEmotionTheme] = useState(getThemeForEmotion('happiness'));
  const [isEmotionDetectionActive, setIsEmotionDetectionActive] = useState(false);
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);
  const [fastMode, setFastMode] = useState(true); // Enable fast mode by default

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

  // Cleanup camera on unmount
  // Cleanup effect and emotion detection
  useEffect(() => {
    // Initialize emotion detection when game starts playing
    if (gameState === 'playing' && !isEmotionDetectionActive) {
      initializeEmotionDetection();
    }
    
    // Cleanup when game ends or component unmounts
    return () => {
      if (isEmotionDetectionActive) {
        console.log('🧹 Cleaning up emotion detection for Kitten Match Game');
        emotionDetectionService.stopEmotionDetection();
        setIsEmotionDetectionActive(false);
      }
    };
  }, [gameState, isEmotionDetectionActive]);

  // Additional cleanup when game state changes
  useEffect(() => {
    if (gameState === 'complete' || gameState === 'menu') {
      if (isEmotionDetectionActive) {
        console.log('🎮 Game ended, stopping emotion detection');
        emotionDetectionService.stopEmotionDetection();
        setIsEmotionDetectionActive(false);
      }
    }
  }, [gameState, isEmotionDetectionActive]);

  // Initialize emotion detection
  const initializeEmotionDetection = async () => {
    try {
      // Enable camera preview to improve face detection
      const success = await emotionDetectionService.startEmotionDetection(handleEmotionDetected, true);
      if (success) {
        setIsEmotionDetectionActive(true);
        // Apply fast mode if enabled
        if (fastMode) {
          emotionDetectionService.enableFastMode();
        } else {
          emotionDetectionService.enableNormalMode();
        }
        console.log('🎯 Emotion detection initialized for Kitten Match Game');
      }
    } catch (error) {
      console.error('❌ Failed to initialize emotion detection:', error);
    }
  };

  // Toggle fast mode
  useEffect(() => {
    if (isEmotionDetectionActive) {
      if (fastMode) {
        emotionDetectionService.enableFastMode();
      } else {
        emotionDetectionService.enableNormalMode();
      }
    }
  }, [fastMode, isEmotionDetectionActive]);

  // Handle emotion detection results
  const handleEmotionDetected = (emotionData) => {
    const { emotion, confidence } = emotionData;
    
    console.log(`🎭 Emotion detected: ${emotion} (${Math.round(confidence * 100)}%)`);
    
    setCurrentEmotion(emotion);
    
    // Update theme based on emotion (always update for immediate visual feedback)
    const newTheme = getThemeForEmotion(emotion);
    console.log(`🎨 Changing theme to:`, newTheme);
    setEmotionTheme(newTheme);
    
    // Show emotion feedback briefly only for high confidence or fast mode
    if (confidence > 0.5 || fastMode) {
      setShowEmotionFeedback(true);
      setTimeout(() => setShowEmotionFeedback(false), fastMode ? 2000 : 3000);
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      const result = await emotionDetectionService.testAPIConnection();
      if (result.success) {
        alert('✅ API is working! ' + result.message);
      } else {
        alert('❌ API test failed: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error testing API: ' + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: emotionTheme.colors.background || `linear-gradient(-45deg, ${emotionTheme.colors.primary}40, ${emotionTheme.colors.secondary}40, ${emotionTheme.colors.accent}40, ${currentThemeData.colors.frontSecondary}20)`,
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

      {/* Game Info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '25px',
        padding: '10px 20px',
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
        <span>⭐ Score: {score}</span>
        <span>🔥 Combo: {combo}</span>
      </div>

      {/* Emotion Feedback */}
      {showEmotionFeedback && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(45deg, ${emotionTheme.colors.primary}, ${emotionTheme.colors.secondary})`,
          color: 'white',
          padding: '20px 30px',
          borderRadius: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1002,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          animation: 'emotionPulse 3s ease-out',
          textAlign: 'center'
        }}>
          <div>{emotionTheme.particles}</div>
          <div>Feeling {currentEmotion}!</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>{emotionTheme.description}</div>
        </div>
      )}

      {/* Simple Theme Status */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 1001,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.8)'
      }}>
        Theme is {emotionTheme.name}
      </div>

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
                <button className="action-btn secondary" onClick={testAPIConnection}>
                  🔌 Test API
                </button>
              </div>
              <div className="game-features">
                <h3>✨ Game Features:</h3>
                <ul>
                  <li>🎮 Multiple difficulty levels</li>
                  <li>🦆 6 different themed experiences</li>
                  <li>🎉 Encouraging feedback for matches</li>
                  <li>🏆 Score and combo system</li>
                  <li>♿ Dyslexia-friendly design</li>
                </ul>
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
            <div className="game-board">
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

        .game-features {
          background: rgba(${currentThemeData.colors.primary.replace('#', '')}, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: left;
        }

        .game-features h3 {
          color: ${currentThemeData.colors.primary};
          margin-bottom: 1rem;
        }

        .game-features ul {
          list-style: none;
          padding: 0;
        }

        .game-features li {
          padding: 0.5rem 0;
          color: #555;
          font-weight: 600;
        }

        .theme-selector {
          margin-top: 1.5rem;
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

        .encouraging-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(45deg, ${currentThemeData.colors.primary}, ${currentThemeData.colors.secondary});
          color: white;
          padding: 1rem 2rem;
          border-radius: 25px;
          font-size: 1.5rem;
          font-weight: bold;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          animation: encourageAnimation 2s ease-out;
          text-align: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes encourageAnimation {
          0% { 
            transform: translate(-50%, -50%) scale(0.5); 
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

        .card {
          aspect-ratio: 1;
          border-radius: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .card:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .card.matched {
          opacity: 0.8;
          transform: scale(0.95);
          animation: matchPulse 0.6s ease-out;
        }

        @keyframes matchPulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.95); }
        }

        .card-content {
          font-size: 2.5rem;
        }

        .game-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .action-btn {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: inherit;
          font-size: 1rem;
        }

        .action-btn.large {
          padding: 1.2rem 2rem;
          font-size: 1.1rem;
          width: 250px;
          justify-content: center;
        }

        .action-btn.primary {
          background: linear-gradient(45deg, ${currentThemeData.colors.primary}, ${currentThemeData.colors.secondary});
          color: white;
          border: 2px solid transparent;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.9);
          color: ${currentThemeData.colors.primary};
          border: 2px solid ${currentThemeData.colors.primary};
        }

        .action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .game-complete {
          text-align: center;
          padding: 2rem;
        }

        .game-complete h3 {
          font-size: 2rem;
          color: ${currentThemeData.colors.primary};
          margin-bottom: 1rem;
          animation: celebrateText 1s ease-out;
        }

        @keyframes celebrateText {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .complete-stats {
          background: rgba(${currentThemeData.colors.primary.replace('#', '')}, 0.1);
          border-radius: 15px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .complete-stats p {
          margin: 0.5rem 0;
          font-weight: 600;
          color: #333;
        }

        .complete-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .theme-options {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .theme-btn {
            padding: 10px 12px;
          }

          .theme-emoji {
            font-size: 1.5rem;
          }

          .theme-name {
            font-size: 0.8rem;
          }

          .game-container {
            margin: 0;
            padding: 1rem;
          }

          .game-board {
            grid-template-columns: repeat(3, 1fr);
            max-width: 300px;
          }

          .card {
            font-size: 2rem;
          }

          .action-btn.large {
            width: 100%;
          }

          .complete-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default KittenMatchGame;