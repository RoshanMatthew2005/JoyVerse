import React, { useState, useEffect, useRef, useCallback } from 'react';
import './game.css';

const MissingLetterPop = () => {
  // Game state
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [missingLetter, setMissingLetter] = useState('');
  const [missingPosition, setMissingPosition] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [bubbles, setBubbles] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [completedWord, setCompletedWord] = useState('');
  const [feedback, setFeedback] = useState([]);

  // Refs
  const gameTimerRef = useRef(null);
  const bubbleIdRef = useRef(0);
  const gameAreaRef = useRef(null);

  // Constants
  const words = [
    'CAT', 'DOG', 'SUN', 'TREE', 'FISH', 'BIRD', 'CAKE', 
    'BOOK', 'BALL', 'HAND', 'FOOT', 'STAR', 'MOON', 'HAPPY',
    'FROG', 'JUMP', 'PLAY', 'SING', 'BLUE', 'PINK', 'DUCK',
    'BEAR', 'FIVE', 'FOUR', 'NINE', 'GOLD', 'SOFT', 'SNOW',
    'RAIN', 'WIND', 'CLOUD', 'FIRE', 'ROCK', 'SAND'
  ];

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 
                  'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];

  // Sound effect function
  const playPopSound = useCallback((isCorrect) => {
    if (!soundEnabled) return;
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = isCorrect ? 'sine' : 'square';
      oscillator.frequency.value = isCorrect ? (500 + Math.random() * 500) : (200 + Math.random() * 200);
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
      
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    } catch (e) {
      console.log("Audio error:", e);
    }
  }, [soundEnabled]);

  // Improved bubble positioning with strict boundaries
  const findNonOverlappingPosition = useCallback((size, existingBubbles) => {
    const maxAttempts = 100;
    const padding = 20;
    const gameArea = gameAreaRef.current;
    
    if (!gameArea) return { x: 50, y: 50 };
    
    // Get safe area dimensions accounting for bubble size and padding
    const containerWidth = gameArea.offsetWidth;
    const containerHeight = gameArea.offsetHeight;
    const maxX = containerWidth - size - padding;
    const maxY = containerHeight - size - padding;
    
    // If container is too small for bubbles, scale them down
    const adjustedSize = Math.min(size, Math.min(containerWidth, containerHeight) - padding * 2);
    const adjustedMaxX = containerWidth - adjustedSize - padding;
    const adjustedMaxY = containerHeight - adjustedSize - padding;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.floor(Math.random() * (adjustedMaxX - padding)) + padding;
      const y = Math.floor(Math.random() * (adjustedMaxY - padding)) + padding;
      
      let overlaps = false;
      for (const bubble of existingBubbles) {
        const minDistance = (adjustedSize + bubble.size) / 2 + padding;
        const dx = x - bubble.x;
        const dy = y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        return { 
          x: Math.max(padding, Math.min(x, adjustedMaxX)), 
          y: Math.max(padding, Math.min(y, adjustedMaxY)),
          size: adjustedSize
        };
      }
    }
    
    // Fallback to random position within safe area
    return { 
      x: Math.max(padding, Math.random() * adjustedMaxX),
      y: Math.max(padding, Math.random() * adjustedMaxY),
      size: adjustedSize
    };
  }, []);

  // Start new round with properly contained bubbles
  const startRound = useCallback(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    const position = Math.floor(Math.random() * (word.length - 2)) + 1;
    const letter = word[position];
    
    setCurrentWord(word);
    setMissingPosition(position);
    setMissingLetter(letter);
    setBubbles([]);
    setCompletedWord('');

    setTimeout(() => {
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const newBubbles = [];
      const existingPositions = [];

      // Create correct letter bubble (70-100px)
      const correctSize = Math.floor(Math.random() * 30) + 70;
      const correctPosition = findNonOverlappingPosition(correctSize, existingPositions);
      
      newBubbles.push({
        id: bubbleIdRef.current++,
        letter,
        isCorrect: true,
        size: correctPosition.size || correctSize,
        x: correctPosition.x,
        y: correctPosition.y,
        colorClass: `bubble-color-${Math.floor(Math.random() * 6) + 1}`,
        animationDelay: Math.random() * 2
      });
      
      existingPositions.push({ 
        x: correctPosition.x, 
        y: correctPosition.y, 
        size: correctPosition.size || correctSize 
      });

      // Create wrong letter bubbles (60-90px)
      const wrongLettersCount = 3;
      const usedLetters = new Set([letter]);
      
      for (let i = 0; i < wrongLettersCount; i++) {
        let randomLetter;
        do {
          randomLetter = letters[Math.floor(Math.random() * letters.length)];
        } while (usedLetters.has(randomLetter));
        
        usedLetters.add(randomLetter);
        
        const size = Math.floor(Math.random() * 30) + 60;
        const position = findNonOverlappingPosition(size, existingPositions);
        
        newBubbles.push({
          id: bubbleIdRef.current++,
          letter: randomLetter,
          isCorrect: false,
          size: position.size || size,
          x: position.x,
          y: position.y,
          colorClass: `bubble-color-${Math.floor(Math.random() * 6) + 1}`,
          animationDelay: Math.random() * 2
        });
        
        existingPositions.push({ 
          x: position.x, 
          y: position.y, 
          size: position.size || size 
        });
      }

      setBubbles(newBubbles);
    }, 100);
  }, [words, letters, findNonOverlappingPosition]);

  // Handle bubble click
  const handleBubbleClick = useCallback((bubbleId, letter, isCorrect, x, y) => {
    if (!gameActive) return;

    playPopSound(isCorrect);

    // Add feedback
    const newFeedback = {
      id: Date.now(),
      text: isCorrect ? '+10' : 'Try again!',
      isCorrect,
      x: x + 40,
      y: y + 40
    };

    setFeedback(prev => [...prev, newFeedback]);

    setTimeout(() => {
      setFeedback(prev => prev.filter(f => f.id !== newFeedback.id));
    }, 1000);

    setBubbles(prev => prev.filter(b => b.id !== bubbleId));

    if (isCorrect) {
      setScore(prev => prev + 10);
      const wordArray = currentWord.split('');
      wordArray[missingPosition] = `<span style="color:#fffa65">${wordArray[missingPosition]}</span>`;
      setCompletedWord(wordArray.join(''));
      
      setTimeout(() => {
        setCompletedWord('');
        startRound();
      }, 1500);
    } else {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= 3) {
          setCurrentTheme(prevTheme => (prevTheme % 4) + 1);
          return 0;
        }
        return newMistakes;
      });
    }
  }, [gameActive, playPopSound, currentWord, missingPosition, startRound]);

  // Timer effect
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      setShowGameOver(true);
    }

    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, [gameActive, timeLeft]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameActive && bubbles.length > 0) {
        startRound();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameActive, bubbles.length, startRound]);

  // Start game
  const startGame = () => {
    if (gameActive) {
      setGameActive(false);
    } else {
      setGameActive(true);
      setShowGameOver(false);
      setScore(0);
      setMistakes(0);
      setTimeLeft(60);
      setCurrentTheme(1);
      startRound();
    }
  };

  // Reset game
  const resetGame = () => {
    setGameActive(false);
    setScore(0);
    setMistakes(0);
    setTimeLeft(60);
    setCurrentTheme(1);
    setBubbles([]);
    setCompletedWord('');
    setShowGameOver(false);
    setFeedback([]);
  };

  // Create word display with missing letter
  const createWordDisplay = () => {
    if (!currentWord) return '';
    
    return currentWord.split('').map((letter, index) => (
      <span key={index} className={index === missingPosition ? 'missing' : ''}>
        {index === missingPosition ? '_' : letter}
      </span>
    ));
  };

  return (
    <div className={`missing-letter-game theme-${currentTheme}`}>
      {/* Settings */}
      <div className="settings">
        <label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          <span>Sound Effects</span>
        </label>
      </div>

      {/* Game Container */}
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">Missing Letter Pop!</h1>
          
          {/* Word Display */}
          <div className="word-display">
            {createWordDisplay()}
          </div>

          {/* Stats */}
          <div className="stats-container">
            <div className="stat-box">Score: {score}</div>
            <div className="stat-box">Time: {timeLeft}s</div>
            <div className="stat-box">Mistakes: {mistakes}/3</div>
          </div>
        </div>

        {/* Game Area with strict boundaries */}
        <div ref={gameAreaRef} className="game-area">
          {/* Bubbles with guaranteed containment */}
          {bubbles.map(bubble => {
            const gameArea = gameAreaRef.current;
            const maxX = gameArea ? gameArea.offsetWidth - bubble.size - 20 : 800;
            const maxY = gameArea ? gameArea.offsetHeight - bubble.size - 20 : 384;
            
            const safeX = Math.max(20, Math.min(bubble.x, maxX));
            const safeY = Math.max(20, Math.min(bubble.y, maxY));
            
            return (
              <div
                key={bubble.id}
                className={`bubble ${bubble.colorClass}`}
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${safeX}px`,
                  top: `${safeY}px`,
                  animationDelay: `${bubble.animationDelay}s`,
                  fontSize: `${Math.min(bubble.size * 0.4, 36)}px`,
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBubbleClick(bubble.id, bubble.letter, bubble.isCorrect, safeX, safeY);
                }}
              >
                {bubble.letter}
              </div>
            );
          })}

          {/* Completed Word Display */}
          {completedWord && (
            <div 
              className="completed-word"
              dangerouslySetInnerHTML={{ __html: completedWord }}
            />
          )}

          {/* Feedback */}
          {feedback.map(fb => (
            <div
              key={fb.id}
              className={`feedback ${fb.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
              style={{
                left: `${fb.x}px`,
                top: `${fb.y}px`,
              }}
            >
              {fb.text}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button
          onClick={startGame}
          className="btn btn-start"
        >
          {gameActive ? 'Pause Game' : 'Start Game'}
        </button>
        <button
          onClick={resetGame}
          className="btn btn-reset"
        >
          Reset Game
        </button>
      </div>

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="game-over-modal">
          <div className="modal-content">
            <h2 className="modal-title">Game Over!</h2>
            <p className="modal-score">Your final score: {score}</p>
            <button
              onClick={() => {
                setShowGameOver(false);
                resetGame();
              }}
              className="btn-play-again"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissingLetterPop;