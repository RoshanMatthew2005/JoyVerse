// MusicApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const MusicApp = () => {
  const [isDayTheme, setIsDayTheme] = useState(true);
  const [activeInstrument, setActiveInstrument] = useState(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Piano notes frequencies
  const pianoNotes = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25, // C5
    587.33, // D5
    659.25, // E5
  ];

  // Generate sound using Web Audio API
  const playSound = (frequency, waveType = 'sine', duration = 0.5) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = waveType;
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Random piano sound for keyboard
  const playRandomPiano = () => {
    const randomNote = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
    playSound(randomNote, 'sine', 0.8);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event) => {
      event.preventDefault();
      playRandomPiano();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Instrument configurations
  const instruments = [
    { 
      name: 'Piano', 
      icon: '🎹', 
      frequency: 440, 
      waveType: 'sine', 
      gradientClass: 'gradient-pink-purple' 
    },
    { 
      name: 'Guitar', 
      icon: '🎸', 
      frequency: 330, 
      waveType: 'sawtooth', 
      gradientClass: 'gradient-orange-red' 
    },
    { 
      name: 'Violin', 
      icon: '🎻', 
      frequency: 659, 
      waveType: 'triangle', 
      gradientClass: 'gradient-yellow-orange' 
    },
    { 
      name: 'Trumpet', 
      icon: '🎺', 
      frequency: 466, 
      waveType: 'square', 
      gradientClass: 'gradient-blue-indigo' 
    },
    { 
      name: 'Drums', 
      icon: '🥁', 
      frequency: 80, 
      waveType: 'square', 
      gradientClass: 'gradient-red-pink' 
    },
    { 
      name: 'Flute', 
      icon: '🪈', 
      frequency: 523, 
      waveType: 'sine', 
      gradientClass: 'gradient-green-teal' 
    },
    { 
      name: 'Saxophone', 
      icon: '🎷', 
      frequency: 370, 
      waveType: 'sawtooth', 
      gradientClass: 'gradient-purple-pink' 
    },
    { 
      name: 'Harp', 
      icon: '🪕', 
      frequency: 294, 
      waveType: 'triangle', 
      gradientClass: 'gradient-cyan-blue' 
    },
  ];

  const playInstrument = (instrument) => {
    setActiveInstrument(instrument.name);
    playSound(instrument.frequency, instrument.waveType, 1.0);
    
    setTimeout(() => {
      setActiveInstrument(null);
    }, 1000);
  };

  // Theme toggle handler
  const handleThemeToggle = () => {
    setIsDayTheme((prev) => !prev);
  };

  const getThemeClasses = () => ({
    app: `music-app ${isDayTheme ? 'day-theme' : 'night-theme'}`,
    card: `card ${isDayTheme ? 'card-day' : 'card-night'}`,
    text: isDayTheme ? 'text-day' : 'text-night',
    themeBadge: `theme-badge ${isDayTheme ? 'theme-badge-day' : 'theme-badge-night'}`,
    soundWave: isDayTheme ? 'sound-wave-day' : 'sound-wave-night'
  });

  const themeClasses = getThemeClasses();

  return (
    <div className={themeClasses.app}>
      {/* Header */}
      <div className={`header ${themeClasses.card}`}>
        <h1 className="header-title">
          🎵 Music & Sounds 🎵
        </h1>
        <p className={`header-subtitle ${themeClasses.text}`}>
          Touch any instrument or press any key for piano sounds!
        </p>
        <div className={`theme-indicator ${themeClasses.text}`}>
          <span className={themeClasses.themeBadge} style={{ cursor: 'pointer' }} onClick={handleThemeToggle}>
            {isDayTheme ? '☀️ Day Mode (Click for Night)' : '🌙 Night Mode (Click for Day)'}
          </span>
        </div>
      </div>

      {/* Keyboard Instruction */}
      <div className={`keyboard-instruction ${themeClasses.card}`}>
        <p className={`keyboard-text ${themeClasses.text}`}>
          ⌨️ Press any key on your keyboard for random piano sounds! ⌨️
        </p>
      </div>

      {/* Instruments Grid */}
      <div className="instruments-grid">
        {instruments.map((instrument, index) => (
          <div
            key={instrument.name}
            className={`instrument-card ${themeClasses.card} ${
              activeInstrument === instrument.name ? 'active' : ''
            }`}
            onClick={() => playInstrument(instrument)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className={`instrument-icon-container ${instrument.gradientClass}`}>
              <div className="instrument-icon">
                {instrument.icon}
              </div>
            </div>
            <h3 className={`instrument-name ${themeClasses.text}`}>
              {instrument.name}
            </h3>
            <div className={`instrument-bar ${instrument.gradientClass}`}></div>
          </div>
        ))}
      </div>

      {/* Floating Musical Notes Animation */}
      <div className="floating-notes">
        {[1, 2, 3, 4, 5].map((note) => (
          <div
            key={note}
            className={`floating-note ${themeClasses.text}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${note * 0.5}s`,
            }}
          >
            {['🎵', '🎶', '♪', '♫', '♬'][note - 1]}
          </div>
        ))}
      </div>

      {/* Sound Waves Animation */}
      {activeInstrument && (
        <div className="sound-waves">
          <div style={{ position: 'relative' }}>
            {[1, 2, 3].map((wave) => (
              <div
                key={wave}
                className={`sound-wave ${themeClasses.soundWave}`}
                style={{
                  width: `${wave * 100}px`,
                  height: `${wave * 100}px`,
                  left: `${-wave * 50}px`,
                  top: `${-wave * 50}px`,
                  animationDelay: `${wave * 0.2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`footer ${themeClasses.card}`}>
        <p className={`footer-text ${themeClasses.text}`}>
          🌈 Made with love for amazing kids! 🌈
        </p>
      </div>
    </div>
  );
};

export default MusicApp;