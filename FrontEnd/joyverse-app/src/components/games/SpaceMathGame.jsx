import React, { useState, useEffect } from 'react';
import gameScoreService from '../../../services/gameScoreAPI';

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
      
      // Level up every 5 correct answers
      if ((questionsAnswered + 1) % 5 === 0) {
        setCurrentLevel(prev => prev + 1);
        setFeedback('🌟 Level Up! Problems are getting harder!');
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

  return (
    <div className="h-full w-full bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">🚀 Space Math Adventure</h1>
          <div className="flex justify-center items-center gap-8 text-lg">
            <div>Score: <span className="font-bold text-yellow-300">{score}</span></div>
            <div>Level: <span className="font-bold text-blue-300">{currentLevel}</span></div>
            <div>Time: <span className="font-bold text-red-300">{timeLeft}s</span></div>
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          {!gameStarted && !gameOver && (
            <div className="text-center">
              <div className="text-8xl mb-8">🌌</div>
              <h2 className="text-3xl font-bold mb-6">Welcome to Space Math Adventure!</h2>
              <p className="text-xl mb-8 max-w-2xl">
                Solve math problems to navigate through space! The faster you answer, the more points you earn.
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                🚀 Start Adventure
              </button>
            </div>
          )}

          {gameStarted && currentProblem && (
            <div className="text-center max-w-2xl">
              <div className="text-6xl mb-8">🛸</div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
                <h3 className="text-2xl mb-6">Solve this problem to continue your space journey:</h3>
                <div className="text-6xl font-bold mb-8 text-yellow-300">
                  {currentProblem.question} = ?
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="text-4xl text-center bg-white text-gray-800 rounded-xl p-4 w-48 font-bold"
                    placeholder="?"
                    autoFocus
                  />
                  <div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                      Submit Answer 🚀
                    </button>
                  </div>
                </form>
              </div>
              {feedback && (
                <div className="text-2xl font-bold animate-bounce">
                  {feedback}
                </div>
              )}
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <div className="text-8xl mb-8">🏆</div>
              <h2 className="text-4xl font-bold mb-6">Mission Complete!</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <div className="text-2xl mb-4">Final Score: <span className="text-yellow-300 font-bold">{score}</span></div>
                <div className="text-xl mb-2">Questions Answered: {totalQuestions}</div>
                <div className="text-xl mb-2">Correct Answers: {correctAnswers}</div>
                <div className="text-xl mb-4">
                  Accuracy: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </div>
                <div className="text-xl">Highest Level Reached: {currentLevel}</div>
              </div>
              <div className="space-x-4">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:scale-105 transition-transform"
                >
                  🚀 Play Again
                </button>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:scale-105 transition-transform"
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceMathGame;
