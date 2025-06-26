import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Camera, Upload, Gamepad2, Zap, CloudSnow } from 'lucide-react';
import gameScoreService from '../../services/gameScoreAPI';

const KittenMatchGame = ({ onClose, user }) => {
  // Game state
  const [gameState, setGameState] = useState('menu'); // menu, preview, playing, complete, camera
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
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelResponse, setModelResponse] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Game themes
  const themes = [
    {
      name: 'Cute Kittens',
      emojis: ['🐱', '😸', '😺', '😻', '😽', '🙀', '😿', '😾'],
      colors: {
        primary: '#ff6b6b',
        secondary: '#ff8e8e',
        front: '#74b9ff',
        frontSecondary: '#0984e3'
      }
    },
    {
      name: 'Ocean Friends',
      emojis: ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🐚', '🦀'],
      colors: {
        primary: '#00b894',
        secondary: '#00cec9',
        front: '#0984e3',
        frontSecondary: '#74b9ff'
      }
    },
    {
      name: 'Farm Animals',
      emojis: ['🐷', '🐮', '🐴', '🐑', '🐔', '🦆', '🐰', '🐹'],
      colors: {
        primary: '#fdcb6e',
        secondary: '#f39c12',
        front: '#6c5ce7',
        frontSecondary: '#a29bfe'
      }
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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setGameState('camera');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available. You can still play the game without camera features!');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      sendImageToModel(imageData);
    }
  };

  const sendImageToModel = async (imageData) => {
    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'captured_image.jpg');
      formData.append('userId', user?.id || 'anonymous');
      formData.append('gameLevel', level);
      formData.append('timestamp', new Date().toISOString());

      // Send to your model backend
      const modelResponse = await fetch('http://localhost:5001/api/model/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (modelResponse.ok) {
        const result = await modelResponse.json();
        setModelResponse(result);
        
        // Bonus points for using camera feature
        setScore(prev => prev + 200);
        
        // Show success message
        alert(`🎉 Great photo! Model analysis: ${result.message || 'Image processed successfully!'}`);
      } else {
        throw new Error('Failed to process image');
      }
    } catch (error) {
      console.error('Error sending image to model:', error);
      alert('Could not connect to the model backend. Playing without camera features!');
    } finally {
      setIsProcessing(false);
      setGameState('playing'); // Return to game
    }
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
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="game-container">
      {/* Game Header */}
      <div className="game-header">
          <h2>🐱 Kitten Memory Match - Level {level}</h2>
          <div className="game-controls">
            <div className="game-info">
              <span>Score: {score}</span>
              <span>Combo: {combo}</span>
              <span>Theme: {currentThemeData.name}</span>
            </div>
            <button className="close-game-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

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
                <button className="action-btn secondary large" onClick={startCamera}>
                  <Camera size={24} />
                  Take a Photo First!
                </button>
              </div>
              <div className="game-features">
                <h3>✨ Game Features:</h3>
                <ul>
                  <li>🎮 Multiple difficulty levels</li>
                  <li>🦆 4 different animal themes</li>
                  <li>📸 Camera integration with AI analysis</li>
                  <li>🏆 Score and combo system</li>
                  <li>♿ Dyslexia-friendly design</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Camera Interface */}
        {gameState === 'camera' && (
          <div className="camera-interface">
            <h3>📸 Take a Photo!</h3>
            <p>Take a selfie to get bonus points and AI analysis!</p>
            
            <div className="camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            
            <div className="camera-actions">
              <button className="action-btn primary" onClick={capturePhoto}>
                <Camera size={16} />
                Capture Photo
              </button>
              <button className="action-btn secondary" onClick={() => {
                stopCamera();
                setGameState('menu');
              }}>
                Skip Camera
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <h3>🤖 AI is analyzing your photo...</h3>
              <p>Please wait while our model processes your image!</p>
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
            
            <div className="game-actions">
              <button className="action-btn secondary" onClick={onClose}>
                <X size={16} />
                Give Up
              </button>
              <button className="action-btn primary" onClick={startCamera}>
                <Camera size={16} />
                Take Photo
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
            {capturedImage && (
              <div className="captured-photo">
                <p>📸 Your photo from this session:</p>
                <img src={capturedImage} alt="Captured" className="photo-thumbnail" />
              </div>
            )}
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
          border-radius: 25px;
          padding: 2rem;
          margin: 2rem;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          border: 3px solid ${currentThemeData.colors.primary};
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

        .camera-interface {
          text-align: center;
          padding: 1rem;
        }

        .camera-interface h3 {
          color: ${currentThemeData.colors.primary};
          margin-bottom: 0.5rem;
        }

        .camera-interface p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .camera-container {
          margin: 1.5rem 0;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .camera-video {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 15px;
        }

        .camera-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .processing-overlay {
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

        .processing-content {
          text-align: center;
          color: white;
        }

        .processing-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        .game-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
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

        .captured-photo {
          margin: 1rem 0;
        }

        .photo-thumbnail {
          width: 150px;
          height: auto;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
          .game-container {
            margin: 1rem;
            padding: 1.5rem;
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

          .camera-video {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default KittenMatchGame;
CloudSnow