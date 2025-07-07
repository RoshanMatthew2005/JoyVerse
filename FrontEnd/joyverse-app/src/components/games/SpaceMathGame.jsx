import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Rocket, Sparkles, Trophy, ArrowRight, Camera, X } from 'lucide-react';
import gameScoreService from '../../services/gameScoreAPI';
import './SpaceMathGame.css';

const SpaceMathGame = ({ onClose, user }) => {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [stars, setStars] = useState([]);
  const [twinklingStars, setTwinklingStars] = useState(new Set());
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Emotion detection state
  const [emotion, setEmotion] = useState('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [emotionFeedback, setEmotionFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionTimerRef = useRef(null);

  // Emotion messages for different feelings
  const emotionMessages = {
    happiness: ['Great job, space explorer!', 'Your joy lights up the galaxy!', 'Keep that cosmic smile shining!'],
    sadness: ['Every astronaut faces challenges!', 'You are stronger than you know!', 'The stars believe in you!'],
    anger: ['Channel that energy into math power!', 'Use your determination!', 'You can conquer any equation!'],
    fear: ['You are brave enough for space travel!', 'One step at a time, explorer!', 'Courage is your superpower!'],
    surprise: ['What an amazing discovery!', 'The universe is full of wonders!', 'Your curiosity fuels exploration!'],
    disgust: ['Stay focused on the stars!', 'You can navigate any challenge!', 'Keep your eyes on the prize!'],
    neutral: ['Ready for space adventure!', 'Lets explore the cosmos!', 'Math missions await!']
  };

  // Planet themes and facts with emotion-responsive variations
  const planets = [
    {
      name: "Mercury",
      themes: {
        happiness: { bg: 'mercury-happy-bg', accent: 'mercury-happy-accent', text: 'mercury-happy-text' },
        sadness: { bg: 'mercury-sad-bg', accent: 'mercury-sad-accent', text: 'mercury-sad-text' },
        anger: { bg: 'mercury-angry-bg', accent: 'mercury-angry-accent', text: 'mercury-angry-text' },
        fear: { bg: 'mercury-fear-bg', accent: 'mercury-fear-accent', text: 'mercury-fear-text' },
        surprise: { bg: 'mercury-surprise-bg', accent: 'mercury-surprise-accent', text: 'mercury-surprise-text' },
        disgust: { bg: 'mercury-disgust-bg', accent: 'mercury-disgust-accent', text: 'mercury-disgust-text' },
        neutral: { bg: 'mercury-bg', accent: 'mercury-accent', text: 'mercury-text' }
      },
      fact: "Mercury is the smallest planet and closest to the Sun. A day on Mercury lasts 59 Earth days!"
    },
    {
      name: "Venus",
      themes: {
        happiness: { bg: 'venus-happy-bg', accent: 'venus-happy-accent', text: 'venus-happy-text' },
        sadness: { bg: 'venus-sad-bg', accent: 'venus-sad-accent', text: 'venus-sad-text' },
        anger: { bg: 'venus-angry-bg', accent: 'venus-angry-accent', text: 'venus-angry-text' },
        fear: { bg: 'venus-fear-bg', accent: 'venus-fear-accent', text: 'venus-fear-text' },
        surprise: { bg: 'venus-surprise-bg', accent: 'venus-surprise-accent', text: 'venus-surprise-text' },
        disgust: { bg: 'venus-disgust-bg', accent: 'venus-disgust-accent', text: 'venus-disgust-text' },
        neutral: { bg: 'venus-bg', accent: 'venus-accent', text: 'venus-text' }
      },
      fact: "Venus is the hottest planet with temperatures reaching 900°F! It's covered in thick, toxic clouds."
    },
    {
      name: "Earth",
      themes: {
        happiness: { bg: 'earth-happy-bg', accent: 'earth-happy-accent', text: 'earth-happy-text' },
        sadness: { bg: 'earth-sad-bg', accent: 'earth-sad-accent', text: 'earth-sad-text' },
        anger: { bg: 'earth-angry-bg', accent: 'earth-angry-accent', text: 'earth-angry-text' },
        fear: { bg: 'earth-fear-bg', accent: 'earth-fear-accent', text: 'earth-fear-text' },
        surprise: { bg: 'earth-surprise-bg', accent: 'earth-surprise-accent', text: 'earth-surprise-text' },
        disgust: { bg: 'earth-disgust-bg', accent: 'earth-disgust-accent', text: 'earth-disgust-text' },
        neutral: { bg: 'earth-bg', accent: 'earth-accent', text: 'earth-text' }
      },
      fact: "Earth is the only known planet with life! 71% of Earth's surface is covered by water."
    },
    {
      name: "Mars",
      themes: {
        happiness: { bg: 'mars-happy-bg', accent: 'mars-happy-accent', text: 'mars-happy-text' },
        sadness: { bg: 'mars-sad-bg', accent: 'mars-sad-accent', text: 'mars-sad-text' },
        anger: { bg: 'mars-angry-bg', accent: 'mars-angry-accent', text: 'mars-angry-text' },
        fear: { bg: 'mars-fear-bg', accent: 'mars-fear-accent', text: 'mars-fear-text' },
        surprise: { bg: 'mars-surprise-bg', accent: 'mars-surprise-accent', text: 'mars-surprise-text' },
        disgust: { bg: 'mars-disgust-bg', accent: 'mars-disgust-accent', text: 'mars-disgust-text' },
        neutral: { bg: 'mars-bg', accent: 'mars-accent', text: 'mars-text' }
      },
      fact: "Mars is called the Red Planet because of iron oxide (rust) on its surface. It has the largest volcano in our solar system!"
    },
    {
      name: "Jupiter",
      themes: {
        happiness: { bg: 'jupiter-happy-bg', accent: 'jupiter-happy-accent', text: 'jupiter-happy-text' },
        sadness: { bg: 'jupiter-sad-bg', accent: 'jupiter-sad-accent', text: 'jupiter-sad-text' },
        anger: { bg: 'jupiter-angry-bg', accent: 'jupiter-angry-accent', text: 'jupiter-angry-text' },
        fear: { bg: 'jupiter-fear-bg', accent: 'jupiter-fear-accent', text: 'jupiter-fear-text' },
        surprise: { bg: 'jupiter-surprise-bg', accent: 'jupiter-surprise-accent', text: 'jupiter-surprise-text' },
        disgust: { bg: 'jupiter-disgust-bg', accent: 'jupiter-disgust-accent', text: 'jupiter-disgust-text' },
        neutral: { bg: 'jupiter-bg', accent: 'jupiter-accent', text: 'jupiter-text' }
      },
      fact: "Jupiter is the largest planet! It has a Great Red Spot that's a storm bigger than Earth and has been raging for hundreds of years."
    },
    {
      name: "Saturn",
      themes: {
        happiness: { bg: 'saturn-happy-bg', accent: 'saturn-happy-accent', text: 'saturn-happy-text' },
        sadness: { bg: 'saturn-sad-bg', accent: 'saturn-sad-accent', text: 'saturn-sad-text' },
        anger: { bg: 'saturn-angry-bg', accent: 'saturn-angry-accent', text: 'saturn-angry-text' },
        fear: { bg: 'saturn-fear-bg', accent: 'saturn-fear-accent', text: 'saturn-fear-text' },
        surprise: { bg: 'saturn-surprise-bg', accent: 'saturn-surprise-accent', text: 'saturn-surprise-text' },
        disgust: { bg: 'saturn-disgust-bg', accent: 'saturn-disgust-accent', text: 'saturn-disgust-text' },
        neutral: { bg: 'saturn-bg', accent: 'saturn-accent', text: 'saturn-text' }
      },
      fact: "Saturn has beautiful rings made of ice and rock! It's so light that it would float in water if there was a bathtub big enough."
    },
    {
      name: "Uranus",
      themes: {
        happiness: { bg: 'uranus-happy-bg', accent: 'uranus-happy-accent', text: 'uranus-happy-text' },
        sadness: { bg: 'uranus-sad-bg', accent: 'uranus-sad-accent', text: 'uranus-sad-text' },
        anger: { bg: 'uranus-angry-bg', accent: 'uranus-angry-accent', text: 'uranus-angry-text' },
        fear: { bg: 'uranus-fear-bg', accent: 'uranus-fear-accent', text: 'uranus-fear-text' },
        surprise: { bg: 'uranus-surprise-bg', accent: 'uranus-surprise-accent', text: 'uranus-surprise-text' },
        disgust: { bg: 'uranus-disgust-bg', accent: 'uranus-disgust-accent', text: 'uranus-disgust-text' },
        neutral: { bg: 'uranus-bg', accent: 'uranus-accent', text: 'uranus-text' }
      },
      fact: "Uranus rotates on its side! It's the coldest planet with temperatures dropping to -371°F."
    },
    {
      name: "Neptune",
      themes: {
        happiness: { bg: 'neptune-happy-bg', accent: 'neptune-happy-accent', text: 'neptune-happy-text' },
        sadness: { bg: 'neptune-sad-bg', accent: 'neptune-sad-accent', text: 'neptune-sad-text' },
        anger: { bg: 'neptune-angry-bg', accent: 'neptune-angry-accent', text: 'neptune-angry-text' },
        fear: { bg: 'neptune-fear-bg', accent: 'neptune-fear-accent', text: 'neptune-fear-text' },
        surprise: { bg: 'neptune-surprise-bg', accent: 'neptune-surprise-accent', text: 'neptune-surprise-text' },
        disgust: { bg: 'neptune-disgust-bg', accent: 'neptune-disgust-accent', text: 'neptune-disgust-text' },
        neutral: { bg: 'neptune-bg', accent: 'neptune-accent', text: 'neptune-text' }
      },
      fact: "Neptune has the strongest winds in the solar system, reaching speeds of 1,200 mph! It takes 165 Earth years to orbit the Sun."
    }
  ];

  const currentTheme = planets[currentPlanet].themes[emotion] || planets[currentPlanet].themes.neutral;

  // Debug emotion and theme changes
  useEffect(() => {
    console.log(`🎭 Emotion changed to: ${emotion}, Planet: ${planets[currentPlanet].name}, Theme: ${currentTheme.bg}`);
  }, [emotion, currentPlanet, currentTheme.bg]);

  // Debug camera state changes
  useEffect(() => {
    console.log(`📹 Camera state changed - Active: ${cameraActive}, Stream: ${!!stream}, Error: ${cameraError}`);
  }, [cameraActive, stream, cameraError]);

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

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    console.log('🎥 Initializing camera for SpaceMath...');
    
    if (cameraActive) {
      console.log('⚠️ Camera already active, skipping initialization');
      return;
    }
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('📹 Media stream obtained:', mediaStream.id);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        console.log('🎬 Video element updated with stream');
      }
      
      setCameraActive(true);
      setCameraError(null);
      console.log('✅ SpaceMath camera initialized successfully');
    } catch (error) {
      console.error('❌ SpaceMath camera initialization error:', error);
      setCameraError('Unable to access camera. Please allow camera permissions.');
    }
  }, [cameraActive]);

  // Capture image from camera
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('❌ Missing video or canvas ref in SpaceMath');
      return null;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log('📷 SpaceMath image captured, blob size:', blob?.size);
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }, []);

  // Analyze emotion using FastAPI
  const analyzeEmotion = useCallback(async () => {
    console.log('🔍 Starting SpaceMath emotion analysis...');
    
    if (!cameraActive) {
      console.log('❌ SpaceMath camera not active, skipping emotion analysis');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      const imageBlob = await captureImage();
      
      if (!imageBlob) {
        console.log('❌ No image captured in SpaceMath');
        return;
      }
      
      console.log('📤 Sending SpaceMath image to API...');
      const formData = new FormData();
      formData.append('file', imageBlob, 'spacemath_emotion.jpg');
      
      const response = await fetch('http://localhost:8001/predict', {
        method: 'POST',
        body: formData,
      });
      
      console.log('📡 SpaceMath API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 SpaceMath API Response:', result);
        const { emotion: detectedEmotion, confidence } = result;
        
        // Update emotion state
        const previousEmotion = emotion;
        setEmotion(detectedEmotion);
        setEmotionConfidence(confidence);
        
        // Add to history
        setEmotionHistory(prev => [...prev.slice(-19), {
          emotion: detectedEmotion,
          confidence,
          timestamp: Date.now()
        }]);
        
        // Set feedback message
        const messages = emotionMessages[detectedEmotion] || emotionMessages.neutral;
        setEmotionFeedback(messages[Math.floor(Math.random() * messages.length)]);
        
        // Notify about planet theme change if emotion changed significantly
        if (previousEmotion !== detectedEmotion && confidence > 0.5) {
          setTimeout(() => {
            setEmotionFeedback(`🌍 ${planets[currentPlanet].name} responds to your ${detectedEmotion}!`);
          }, 3000);
        }
        
        console.log(`✅ SpaceMath emotion detected: ${detectedEmotion}, Confidence: ${confidence.toFixed(2)}`);
        
        // Show emotion feedback briefly
        setTimeout(() => setEmotionFeedback(''), 6000);
      } else {
        console.error('❌ SpaceMath API request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ SpaceMath emotion analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [cameraActive, captureImage, emotionMessages]);

  // Stop camera when game ends
  const stopCamera = useCallback(() => {
    console.log('🎮 Stopping SpaceMath camera...');
    console.log('🔍 Current camera state - Active:', cameraActive, 'Stream:', !!stream);
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('🛑 Stopping track:', track.kind, track.id);
        track.stop();
      });
      console.log('📹 SpaceMath camera stopped');
    } else {
      console.log('⚠️ No stream to stop');
    }
    
    setStream(null);
    setCameraActive(false);
    setCameraError(null);
    
    // Clear emotion detection timer
    if (emotionTimerRef.current) {
      clearInterval(emotionTimerRef.current);
      console.log('⏰ Emotion detection timer cleared');
    }
    
    // Reset emotion state
    setEmotion('neutral');
    setEmotionConfidence(0);
    setEmotionHistory([]);
    setEmotionFeedback('');
    setIsAnalyzing(false);
    console.log('🔄 Emotion state reset');
  }, [stream, cameraActive]);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      console.log('🔄 Component unmounting, cleaning up camera...');
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('📹 SpaceMath camera stopped on unmount');
      }
      
      // Clear emotion detection timer
      if (emotionTimerRef.current) {
        clearInterval(emotionTimerRef.current);
      }
    };
  }, []);

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
    console.log("Starting SpaceMath game...");
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCurrentLevel(1);
    setQuestionsAnswered(0);
    setConsecutiveMistakes(0);
    setCurrentProblem(generateProblem(1));
    setFeedback('');
    setShowHint(false);
    
    // Set a welcome message
    setEmotionFeedback('Welcome to Space Math! Your journey begins now! 🚀');
    setTimeout(() => setEmotionFeedback(''), 3000);
    
    console.log("SpaceMath game started! gameStarted state set to:", true); 
    
    // Initialize camera and start emotion detection after a short delay
    setTimeout(() => {
      console.log("🎬 Initializing camera after game start...");
      initializeCamera();
      
      // Start emotion detection timer (every 5 seconds) after camera is ready
      setTimeout(() => {
        console.log("⏰ Starting emotion detection timer...");
        emotionTimerRef.current = setInterval(analyzeEmotion, 5000);
      }, 2000);
    }, 500);
    
    // Force a re-render by creating a slight delay
    setTimeout(() => {
      console.log("After timeout - gameStarted state:", true);
    }, 100);
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
          setTimeout(() => endGame(), 2000);
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

  // End game and save score
  const endGame = async () => {
    setGameOver(true);
    
    // Stop camera and emotion detection
    stopCamera();
    
    // Save score to API if user exists
    if (user) {
      try {
        const accuracy = questionsAnswered > 0 ? Math.round((questionsAnswered - consecutiveMistakes) / questionsAnswered * 100) : 0;
        await gameScoreService.saveScore({
          userId: user.userId,
          gameName: 'Space Math Adventure',
          score: score,
          accuracy: accuracy,
          totalQuestions: questionsAnswered,
          correctAnswers: questionsAnswered - consecutiveMistakes
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("Game started state:", gameStarted);
    console.log("Game over state:", gameOver);
  }, [gameStarted, gameOver]);

  // WELCOME SCREEN - If game has not started, show the welcome screen
  if (!gameStarted) {
    console.log("Rendering welcome screen");
    return (
      <div className={`game-container ${currentTheme.bg}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 9999
      }}>
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

        {/* Back button */}
        <button
          onClick={onClose}
          className="planet-switch-button"
          style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 50 }}
        >
          &larr; Back to Dashboard
        </button>

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
            onClick={() => {
              console.log("Start button clicked");
              startGame();
            }}
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

  // MAIN GAME SCREEN - Renders when gameStarted is true
  console.log("Rendering main game screen");
  return (
    <div className={`game-container ${currentTheme.bg}`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 9999
    }}>
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
          {/* Back button for main game screen */}
          <button
            onClick={onClose}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 15px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ← Dashboard
          </button>
          
          {/* Camera and Emotion Display */}
          {cameraActive && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '15px',
              padding: '15px',
              zIndex: 100,
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  🎭 Emotion Detection
                </span>
                <button
                  onClick={stopCamera}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
              
              <div style={{
                width: '150px',
                height: '120px',
                border: '2px solid #667eea',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '10px',
                background: '#000'
              }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  autoPlay
                  muted
                  playsInline
                />
              </div>
              
              {emotion && (
                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                    {(emotionConfidence * 100).toFixed(1)}% confident
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div style={{ textAlign: 'center', color: '#667eea', fontSize: '0.8rem' }}>
                  🤖 Analyzing...
                </div>
              )}
            </div>
          )}
          
          {/* Camera Control Button when camera is not active */}
          {!cameraActive && gameStarted && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                onClick={initializeCamera}
                style={{
                  background: 'rgba(102, 126, 234, 0.9)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 15px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Camera size={16} />
                Enable Camera
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:8001/test');
                    const result = await response.json();
                    console.log('✅ API Test successful:', result);
                    setEmotionFeedback('✅ API Connection successful!');
                    
                    // Also test emotion detection if camera is available
                    if (cameraActive) {
                      setTimeout(async () => {
                        setEmotionFeedback('🧪 Testing emotion detection...');
                        await analyzeEmotion();
                      }, 1000);
                    }
                  } catch (error) {
                    console.error('❌ API Test failed:', error);
                    setEmotionFeedback('❌ API Connection failed! Make sure backend is running on port 8001');
                  }
                  setTimeout(() => setEmotionFeedback(''), 5000);
                }}
                style={{
                  background: 'rgba(34, 197, 94, 0.9)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                🔗 Test API
              </button>
              
              <button
                onClick={() => {
                  // Cycle through emotions to test themes
                  const emotions = ['happiness', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral'];
                  const currentIndex = emotions.indexOf(emotion);
                  const nextEmotion = emotions[(currentIndex + 1) % emotions.length];
                  setEmotion(nextEmotion);
                  setEmotionConfidence(0.8);
                  setEmotionFeedback(`🎭 Testing ${nextEmotion} theme!`);
                  setTimeout(() => setEmotionFeedback(''), 3000);
                }}
                style={{
                  background: 'rgba(168, 85, 247, 0.9)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                🎭 Test Themes
              </button>
            </div>
          )}

          {/* Emotion Feedback */}
          {emotionFeedback && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '15px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              zIndex: 200,
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              {emotionFeedback}
            </div>
          )}

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

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

      {/* Game Over Screen */}
      {gameOver && (
        <div className="level-up-overlay">
          <div className={`level-up-popup ${currentTheme.accent}`} style={{ padding: '2.5rem', maxWidth: '450px' }}>
            <div className="level-up-emoji">🏆</div>
            <h2 className="level-up-title">Mission Complete!</h2>
            
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Final Score: <strong>{score}</strong>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                Level Reached: <strong>{currentLevel}</strong>
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                Planet Explored: <strong>{planets[currentPlanet].name}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={startGame}
                className={`submit-button ${currentTheme.accent}`}
                style={{ margin: 0, padding: '0.8rem 1.5rem' }}
              >
                Play Again 🚀
              </button>
              
              <button
                onClick={onClose}
                className="planet-switch-button"
                style={{ margin: 0, padding: '0.8rem 1.5rem' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceMathGame;
