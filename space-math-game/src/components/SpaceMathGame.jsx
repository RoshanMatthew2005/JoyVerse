import React, { useState, useEffect } from 'react';
import { Star, Rocket, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import './SpaceMathGame.css';

const SpaceMathGame = () => {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [stars, setStars] = useState([]);
  const [twinklingStars, setTwinklingStars] = useState(new Set());
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Planet themes and facts
  const planets = [
    {
      name: "Mercury",
      theme: { bg: 'mercury-bg', accent: 'mercury-accent', text: 'mercury-text' },
      fact: "Mercury is the smallest planet and closest to the Sun. A day on Mercury lasts 59 Earth days!"
    },
    {
      name: "Venus",
      theme: { bg: 'venus-bg', accent: 'venus-accent', text: 'venus-text' },
      fact: "Venus is the hottest planet with temperatures reaching 900°F! It's covered in thick, toxic clouds."
    },
    {
      name: "Earth",
      theme: { bg: 'earth-bg', accent: 'earth-accent', text: 'earth-text' },
      fact: "Earth is the only known planet with life! 71% of Earth's surface is covered by water."
    },
    {
      name: "Mars",
      theme: { bg: 'mars-bg', accent: 'mars-accent', text: 'mars-text' },
      fact: "Mars is called the Red Planet because of iron oxide (rust) on its surface. It has the largest volcano in our solar system!"
    },
    {
      name: "Jupiter",
      theme: { bg: 'jupiter-bg', accent: 'jupiter-accent', text: 'jupiter-text' },
      fact: "Jupiter is the largest planet! It has a Great Red Spot that's a storm bigger than Earth and has been raging for hundreds of years."
    },
    {
      name: "Saturn",
      theme: { bg: 'saturn-bg', accent: 'saturn-accent', text: 'saturn-text' },
      fact: "Saturn has beautiful rings made of ice and rock! It's so light that it would float in water if there was a bathtub big enough."
    },
    {
      name: "Uranus",
      theme: { bg: 'uranus-bg', accent: 'uranus-accent', text: 'uranus-text' },
      fact: "Uranus rotates on its side! It's the coldest planet with temperatures dropping to -371°F."
    },
    {
      name: "Neptune",
      theme: { bg: 'neptune-bg', accent: 'neptune-accent', text: 'neptune-text' },
      fact: "Neptune has the strongest winds in the solar system, reaching speeds of 1,200 mph! It takes 165 Earth years to orbit the Sun."
    }
  ];

  const currentTheme = planets[currentPlanet].theme;

  // Generate 25 stars with slow movement and manage twinkling
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 25; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          moveSpeedX: (Math.random() - 0.5) * 0.02,
          moveSpeedY: (Math.random() - 0.5) * 0.02
        });
      }
      setStars(newStars);
    };
    generateStars();

    // Move stars slowly in 2D
    const moveStars = () => {
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          x: (star.x + star.moveSpeedX + 100) % 100,
          y: (star.y + star.moveSpeedY + 100) % 100
        }))
      );
    };

    // Manage twinkling effect - only 6-8 stars twinkle at once
    const manageTwinkling = () => {
      setTwinklingStars(prevTwinkling => {
        const currentTwinkling = new Set(prevTwinkling);
        
        // Remove some twinkling stars randomly
        currentTwinkling.forEach(starId => {
          if (Math.random() < 0.3) { // 30% chance to stop twinkling
            currentTwinkling.delete(starId);
          }
        });
        
        // Add new twinkling stars if we have less than 8
        while (currentTwinkling.size < 8) {
          const randomStarId = Math.floor(Math.random() * 25);
          if (!currentTwinkling.has(randomStarId)) {
            currentTwinkling.add(randomStarId);
          }
        }
        
        // Ensure we don't exceed 8 twinkling stars
        if (currentTwinkling.size > 8) {
          const starsArray = Array.from(currentTwinkling);
          const toRemove = starsArray.slice(8);
          toRemove.forEach(starId => currentTwinkling.delete(starId));
        }
        
        return currentTwinkling;
      });
    };

    const moveInterval = setInterval(moveStars, 200);
    const twinkleInterval = setInterval(manageTwinkling, 800);
    
    return () => {
      clearInterval(moveInterval);
      clearInterval(twinkleInterval);
    };
  }, []);

  // Load best score from memory
  useEffect(() => {
    const savedBestScore = parseInt(sessionStorage.getItem('spaceMathBestScore') || '0');
    setBestScore(savedBestScore);
  }, []);

  // Save best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      sessionStorage.setItem('spaceMathBestScore', score.toString());
    }
  }, [score, bestScore]);

  // Generate problems based on level
  const generateProblem = (level) => {
    let num1, num2, operation, answer, question;
    
    switch (level) {
      case 1: // 1 digit addition
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        operation = '+';
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      
      case 2: // 2 digit + 1 digit addition and 1 digit subtraction
        if (Math.random() > 0.5) {
          num1 = Math.floor(Math.random() * 90) + 10; // 2 digit
          num2 = Math.floor(Math.random() * 9) + 1;   // 1 digit
          operation = '+';
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
        } else {
          num1 = Math.floor(Math.random() * 9) + 1;
          num2 = Math.floor(Math.random() * 9) + 1;
          if (num2 > num1) [num1, num2] = [num2, num1];
          operation = '-';
          answer = num1 - num2;
          question = `${num1} - ${num2} = ?`;
        }
        break;
      
      case 3: // 1,2 digit mix subtraction and addition
        num1 = Math.random() > 0.5 ? Math.floor(Math.random() * 90) + 10 : Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        question = `${num1} ${operation} ${num2} = ?`;
        break;
      
      case 4: // 1 digit multiplication
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        operation = '×';
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      
      case 5: // Mix of all previous levels
        return generateProblem(Math.floor(Math.random() * 4) + 1);
      
      default:
        return generateProblem(1);
    }

    return { question, answer, num1, num2, operation };
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentLevel(1);
    setQuestionsAnswered(0);
    setConsecutiveMistakes(0);
    setCurrentProblem(generateProblem(1));
    setFeedback('');
    setShowHint(false);
  };

  const checkAnswer = () => {
    if (!currentProblem || userAnswer === '') return;

    const userNum = parseInt(userAnswer);
    if (userNum === currentProblem.answer) {
      setScore(score + 10);
      setQuestionsAnswered(questionsAnswered + 1);
      setConsecutiveMistakes(0);
      setFeedback('🚀 Excellent! Great job!');
      
      // Check for level up
      if (questionsAnswered + 1 >= 8) {
        if (currentLevel < 5) {
          setTimeout(() => {
            setShowLevelUp(true);
            setTimeout(() => {
              setShowLevelUp(false);
              setCurrentLevel(currentLevel + 1);
              setQuestionsAnswered(0);
              setCurrentProblem(generateProblem(currentLevel + 1));
              setUserAnswer('');
              setFeedback('');
            }, 3000);
          }, 1000);
        } else {
          setFeedback('🎉 Congratulations! You completed all levels!');
        }
      } else {
        setTimeout(() => {
          setCurrentProblem(generateProblem(currentLevel));
          setUserAnswer('');
          setFeedback('');
        }, 1500);
      }
    } else {
      setConsecutiveMistakes(consecutiveMistakes + 1);
      setFeedback(`🛸 Not quite right! The correct answer is ${currentProblem.answer}.`);
      
      // Show encouragement hint after 2+ mistakes
      if (consecutiveMistakes + 1 >= 2) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
      }
      
      setTimeout(() => {
        setCurrentProblem(generateProblem(currentLevel));
        setUserAnswer('');
        setFeedback('');
      }, 2500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const nextPlanet = () => {
    setCurrentPlanet((currentPlanet + 1) % planets.length);
  };

  if (!gameStarted) {
    return (
      <div className={`game-container ${currentTheme.bg}`}>
        {/* Animated stars background */}
        {stars.map(star => (
          <div key={star.id} className="star-container" style={{ left: `${star.x}%`, top: `${star.y}%` }}>
            <div
              className={`star ${twinklingStars.has(star.id) ? 'twinkling' : ''}`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
            />
          </div>
        ))}

        <div className="welcome-screen-centered">
          <div className="welcome-content-centered">
            <Rocket className="rocket-icon-centered" />
            <h1 className={`game-title-centered ${currentTheme.text}`}>
              Solar System Math Quest
            </h1>
            <p className={`game-subtitle-centered ${currentTheme.text}`}>
              Explore planets while solving math problems!
            </p>
          </div>

          <button
            onClick={startGame}
            className={`start-button-centered ${currentTheme.accent}`}
          >
            <span role="img" aria-label="rocket" style={{ marginRight: 8 }}>🚀</span>
            Start Quest
          </button>

          <div className="planet-selector-centered">
            <button
              onClick={nextPlanet}
              className={`planet-button-centered ${currentTheme.text}`}
            >
              <span role="img" aria-label="planet" style={{ marginRight: 8 }}>🪐</span>
              Explore {planets[currentPlanet].name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-container ${currentTheme.bg}`}>
      {/* Animated background stars */}
      {stars.map(star => (
        <div key={star.id} className="star-container" style={{ left: `${star.x}%`, top: `${star.y}%` }}>
          <div
            className={`star ${twinklingStars.has(star.id) ? 'twinkling' : ''}`}
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
          />
        </div>
      ))}

      <div className="game-content">
        {/* Header */}
        <div className="game-header">
          <div className="planet-info">
            <div className="planet-icon">
              🪐
            </div>
            <div className="planet-details">
              <h1 className={`planet-name ${currentTheme.text}`}>{planets[currentPlanet].name} Station</h1>
              <p className={`level-info ${currentTheme.text}`}>Level {currentLevel} - {questionsAnswered}/8 completed</p>
            </div>
          </div>
          <div className="score-container">
            <div className={`score-item ${currentTheme.text}`}>
              <Trophy className="score-icon" />
              Best: {bestScore}
            </div>
            <div className={`score-item ${currentTheme.text}`}>
              <Star className="score-icon" />
              Score: {score}
            </div>
          </div>
        </div>

        {/* Level Up Popup */}
        {showLevelUp && (
          <div className="level-up-overlay">
            <div className={`level-up-popup ${currentTheme.accent}`}>
              <div className="level-up-emoji">🎉</div>
              <h2 className="level-up-title">Level Complete!</h2>
              <p className="level-up-text">Advancing to Level {currentLevel + 1}</p>
              <div className="level-up-next">
                <ArrowRight className="arrow-icon" />
                <span className="next-text">Next Challenge Awaits!</span>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement Hint */}
        {showHint && (
          <div className="hint-container">
            <div className="hint-popup">
              🌟 You're almost there! You need {8 - questionsAnswered} more questions to reach the next level!
            </div>
          </div>
        )}

        {/* Main game area */}
        <div className="game-area">
          <div className="game-card">
            {currentProblem && (
              <div className="problem-container">
                <div className="problem-header">
                  <Sparkles className="sparkles-icon" />
                  <h2 className={`problem-question ${currentTheme.text}`}>
                    {currentProblem.question}
                  </h2>
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
                  onClick={checkAnswer}
                  className={`submit-button ${currentTheme.accent}`}
                >
                  Launch Answer 🚀
                </button>

                {feedback && (
                  <div className={`feedback ${feedback.includes('Excellent') || feedback.includes('Congratulations') ? 'feedback-success' : 'feedback-info'} ${currentTheme.text}`}>
                    <p className="feedback-text">{feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Planet selector and info */}
          <div className="planet-info-section">
            <button
              onClick={nextPlanet}
              className={`planet-switch-button ${currentTheme.text}`}
            >
              🪐 Switch to {planets[(currentPlanet + 1) % planets.length].name}
            </button>
            <div className={`planet-fact ${currentTheme.text}`}>
              <p className="fact-text">{planets[currentPlanet].fact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceMathGame;