import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, Star, Rocket } from 'lucide-react';
import './SpaceMathGame.css';

const SpaceMathGame = () => {
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stars, setStars] = useState([]);

  // Planet data
  const planets = [
    {
      name: 'Mercury',
      emoji: '☿️',
      bgClass: 'mercury-bg',
      accentClass: 'mercury-accent',
      textClass: 'mercury-text',
      facts: [
        'Mercury is the closest planet to the Sun!',
        'A day on Mercury is longer than its year!',
        'Mercury has no atmosphere to trap heat.',
        'Mercury is the smallest planet in our solar system!'
      ]
    },
    {
      name: 'Venus',
      emoji: '♀️',
      bgClass: 'venus-bg',
      accentClass: 'venus-accent',
      textClass: 'venus-text',
      facts: [
        'Venus is the hottest planet in our solar system!',
        'Venus rotates backwards compared to Earth!',
        'A day on Venus is longer than its year!',
        'Venus is often called Earth\'s twin!'
      ]
    },
    {
      name: 'Earth',
      emoji: '🌍',
      bgClass: 'earth-bg',
      accentClass: 'earth-accent',
      textClass: 'earth-text',
      facts: [
        'Earth is the only known planet with life!',
        'Earth has one natural satellite - the Moon!',
        '71% of Earth\'s surface is covered by water!',
        'Earth has the perfect distance from the Sun for life!'
      ]
    },
    {
      name: 'Mars',
      emoji: '♂️',
      bgClass: 'mars-bg',
      accentClass: 'mars-accent',
      textClass: 'mars-text',
      facts: [
        'Mars is known as the Red Planet!',
        'Mars has two small moons: Phobos and Deimos!',
        'A day on Mars is almost the same as Earth!',
        'Mars has the largest volcano in the solar system!'
      ]
    },
    {
      name: 'Jupiter',
      emoji: '♃',
      bgClass: 'jupiter-bg',
      accentClass: 'jupiter-accent',
      textClass: 'jupiter-text',
      facts: [
        'Jupiter is the largest planet in our solar system!',
        'Jupiter has over 80 moons!',
        'Jupiter\'s Great Red Spot is a giant storm!',
        'Jupiter acts like a cosmic vacuum cleaner!'
      ]
    },
    {
      name: 'Saturn',
      emoji: '♄',
      bgClass: 'saturn-bg',
      accentClass: 'saturn-accent',
      textClass: 'saturn-text',
      facts: [
        'Saturn is famous for its beautiful rings!',
        'Saturn could float in water if there was a big enough ocean!',
        'Saturn has 146 confirmed moons!',
        'Saturn\'s rings are made of ice and rock particles!'
      ]
    },
    {
      name: 'Uranus',
      emoji: '♅',
      bgClass: 'uranus-bg',
      accentClass: 'uranus-accent',
      textClass: 'uranus-text',
      facts: [
        'Uranus rotates on its side!',
        'Uranus is the coldest planet in our solar system!',
        'Uranus has faint rings around it!',
        'A year on Uranus equals 84 Earth years!'
      ]
    },
    {
      name: 'Neptune',
      emoji: '♆',
      bgClass: 'neptune-bg',
      accentClass: 'neptune-accent',
      textClass: 'neptune-text',
      facts: [
        'Neptune is the windiest planet in our solar system!',
        'Neptune was discovered using mathematics!',
        'Neptune has 16 known moons!',
        'A year on Neptune equals 165 Earth years!'
      ]
    }
  ];

  const currentPlanetData = planets[currentPlanet];

  // Generate stars background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Generate math problem based on level
  const generateProblem = () => {
    let num1, num2, operation, answer;

    if (level <= 2) {
      // Addition (easy)
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = '+';
      answer = num1 + num2;
    } else if (level <= 4) {
      // Subtraction (medium)
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      operation = '-';
      answer = num1 - num2;
    } else if (level <= 6) {
      // Multiplication (hard)
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      operation = '×';
      answer = num1 * num2;
    } else {
      // Mixed operations (expert)
      const operations = ['+', '-', '×'];
      operation = operations[Math.floor(Math.random() * operations.length)];
      
      if (operation === '+') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
      } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      } else {
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
        answer = num1 * num2;
      }
    }

    setCurrentProblem({ num1, num2, operation, answer });
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    generateProblem();
  };

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (userAnswer === '') return;

    const userNum = parseInt(userAnswer);
    
    if (userNum === currentProblem.answer) {
      setScore(score + level * 10);
      setFeedback('🎉 Correct! Great job, space explorer!');
      
      // Check for level up (every 3 correct answers)
      if ((score + level * 10) >= level * 30) {
        setLevel(level + 1);
        setShowLevelUp(true);
        
        // Change planet every 2 levels
        if (level % 2 === 0 && currentPlanet < planets.length - 1) {
          setCurrentPlanet(currentPlanet + 1);
        }
        
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      setTimeout(() => {
        setFeedback('');
        setUserAnswer('');
        generateProblem();
      }, 1500);
    } else {
      setFeedback(`❌ Not quite! The answer is ${currentProblem.answer}. Try the next one!`);
      setTimeout(() => {
        setFeedback('');
        setUserAnswer('');
        generateProblem();
      }, 2500);
    }
  };

  // Show hint
  const showHintHandler = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  // Switch to next planet
  const switchPlanet = () => {
    setCurrentPlanet((currentPlanet + 1) % planets.length);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  if (!gameStarted) {
    return (
      <div className={`game-container ${currentPlanetData.bgClass} ${currentPlanetData.textClass}`}>
        {/* Stars Background */}
        {stars.map(star => (
          <div
            key={star.id}
            className="star-container"
            style={{ left: `${star.left}%`, top: `${star.top}%` }}
          >
            <div
              className="star twinkling"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`
              }}
            />
          </div>
        ))}

        {/* Welcome Screen */}
        <div className="welcome-screen-centered">
          <div className="welcome-content-centered">
            <Rocket className="rocket-icon-centered" />
            <h1 className="game-title-centered">Space Math Adventure</h1>
            <p className="game-subtitle-centered">
              Explore the galaxy while solving math problems!
            </p>
            <button 
              className={`start-button-centered ${currentPlanetData.accentClass}`}
              onClick={startGame}
            >
              <Rocket size={20} />
              Start Mission
            </button>
          </div>
          
          <div className="planet-selector-centered">
            <button 
              className="planet-button-centered"
              onClick={switchPlanet}
            >
              <span style={{ fontSize: '1.5rem' }}>{currentPlanetData.emoji}</span>
              Explore {currentPlanetData.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${currentPlanetData.bgClass} ${currentPlanetData.textClass}`}>
      {/* Stars Background */}
      {stars.map(star => (
        <div
          key={star.id}
          className="star-container"
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
        >
          <div
            className="star twinkling"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        </div>
      ))}

      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="level-up-overlay">
          <div className={`level-up-popup ${currentPlanetData.accentClass}`}>
            <div className="level-up-emoji">🚀</div>
            <div className="level-up-title">Level Up!</div>
            <div className="level-up-text">You reached Level {level}!</div>
            <div className="level-up-next">
              <span>Next destination:</span>
              <ArrowRight className="arrow-icon" />
              <span>{currentPlanetData.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hint Popup */}
      {showHint && (
        <div className="hint-container">
          <div className="hint-popup">
            💡 Hint: Try breaking down the problem into smaller parts!
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="game-content">
        {/* Header */}
        <div className="game-header">
          <div className="planet-info">
            <div className={`planet-icon ${currentPlanetData.accentClass}`}>
              {currentPlanetData.emoji}
            </div>
            <div className="planet-details">
              <h1>Mission: {currentPlanetData.name}</h1>
              <p>Space Math Adventure</p>
            </div>
          </div>
          
          <div className="score-container">
            <div className="score-item">
              <Star className="score-icon" />
              <span>Level {level}</span>
            </div>
            <div className="score-item">
              <Zap className="score-icon" />
              <span>{score} pts</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="game-area">
          {/* Math Problem Card */}
          <div className="game-card">
            <div className="problem-container">
              {currentProblem && (
                <>
                  <div className="problem-header">
                    <Sparkles className="sparkles-icon" />
                    <div className="problem-question">
                      {currentProblem.num1} {currentProblem.operation} {currentProblem.num2} = ?
                    </div>
                    <Sparkles className="sparkles-icon" />
                  </div>
                  
                  <div className="answer-container">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="answer-input"
                      placeholder="?"
                      autoFocus
                    />
                  </div>
                  
                  <button 
                    onClick={handleAnswerSubmit}
                    className={`submit-button ${currentPlanetData.accentClass}`}
                  >
                    Launch Answer
                  </button>

                  {feedback && (
                    <div className={`feedback ${feedback.includes('Correct') ? 'feedback-success' : 'feedback-info'}`}>
                      <p className="feedback-text">{feedback}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Planet Info Section */}
          <div className="planet-info-section">
            <button 
              className="planet-switch-button"
              onClick={switchPlanet}
            >
              <span style={{ fontSize: '1.2rem' }}>{currentPlanetData.emoji}</span>
              Explore Next Planet
            </button>
            
            <div className="planet-fact">
              <p className="fact-text">
                {currentPlanetData.facts[Math.floor(Math.random() * currentPlanetData.facts.length)]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceMathGame;