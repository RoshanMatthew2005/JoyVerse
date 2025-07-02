import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Eraser, Download, RotateCcw, Circle, Square, Minus, Plus } from 'lucide-react';
import './artstudio.css';
import gameScoreService from '../../../services/gameScoreAPI';
import emotionDetectionService from '../../../services/emotionAPI';
import { getThemeForEmotion, emotionThemes } from '../../../utils/emotionThemes';

const ArtStudio = ({ onClose, user }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(5);  const [tool, setTool] = useState('brush'); // brush, eraser, circle, rectangle, line
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [toolsUsed, setToolsUsed] = useState(new Set(['brush']));
  const [colorsUsed, setColorsUsed] = useState(new Set([currentColor]));
  const [stickersAdded, setStickersAdded] = useState(0);
  const [artworkSaved, setArtworkSaved] = useState(false);
  
  // Emotion detection states
  const [currentEmotion, setCurrentEmotion] = useState('happiness');
  const [emotionTheme, setEmotionTheme] = useState(getThemeForEmotion('happiness'));
  const [isEmotionDetectionActive, setIsEmotionDetectionActive] = useState(false);
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);
  
  // Emotion-based colors for kids
  const getEmotionColors = (emotion) => {
    const theme = getThemeForEmotion(emotion);
    const baseColors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#6C5CE7',
      '#FD79A8', '#E17055', '#00B894', '#FDCB6E', '#E84393'
    ];
    return baseColors;
  };
  
  const colors = getEmotionColors(currentEmotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set background with emotion theme
    ctx.fillStyle = emotionTheme.colors.background || 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set initial drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Initialize emotion detection
    initializeEmotionDetection();
    
    // Cleanup when component unmounts
    return () => {
      if (isEmotionDetectionActive) {
        console.log('🧹 Cleaning up emotion detection for Art Studio');
        emotionDetectionService.stopEmotionDetection();
      }
    };
  }, []);

  // Initialize emotion detection
  const initializeEmotionDetection = async () => {
    try {
      const success = await emotionDetectionService.startEmotionDetection(handleEmotionDetected, false);
      if (success) {
        setIsEmotionDetectionActive(true);
        console.log('🎯 Emotion detection initialized for Art Studio');
      }
    } catch (error) {
      console.error('❌ Failed to initialize emotion detection:', error);
    }
  };

  // Handle emotion detection results
  const handleEmotionDetected = (emotionData) => {
    const { emotion, confidence } = emotionData;
    
    console.log(`🎭 Emotion detected in Art Studio: ${emotion} (${Math.round(confidence * 100)}%)`);
    
    setCurrentEmotion(emotion);
    
    // Update theme based on emotion
    const newTheme = getThemeForEmotion(emotion);
    setEmotionTheme(newTheme);
    
    // Show emotion feedback briefly
    setShowEmotionFeedback(true);
    setTimeout(() => setShowEmotionFeedback(false), 3000);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = emotionTheme.colors.background || 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };  const downloadArt = async () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${user?.childName || 'My'}_Artwork_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    setArtworkSaved(true);
    
    // Save art session score
    await saveArtScore();
  };

  // Save art session score
  const saveArtScore = async () => {
    try {
      const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
      const gameData = {
        timeSpent,
        toolsUsed: Array.from(toolsUsed),
        colorsUsed: Array.from(colorsUsed),
        stickersAdded,
        artworkSaved
      };
      
      const formattedData = gameScoreService.formatGameData('art-studio', gameData);
      await gameScoreService.saveGameScore(formattedData);
      console.log('Art session saved successfully');
    } catch (error) {
      console.error('Failed to save art session:', error);
    }
  };

  // Save score when closing if session was long enough
  const handleClose = async () => {
    // Stop emotion detection
    if (isEmotionDetectionActive) {
      console.log('🎮 Art Studio ended, stopping emotion detection');
      emotionDetectionService.stopEmotionDetection();
      setIsEmotionDetectionActive(false);
    }
    
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
    if (timeSpent > 30) { // Only save if they spent more than 30 seconds
      await saveArtScore();
    }
    onClose();
  };
  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Add emoji sticker at random position
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;
    
    ctx.font = '48px Arial';
    ctx.fillText(emoji, x, y);
    
    setStickersAdded(prev => prev + 1);
  };

  const stickers = ['🌟', '🦋', '🌈', '🌸', '🎈', '🦄', '🌞', '🐱', '🐶', '🦊', '🐸', '🐧', '🦜', '🌺', '🍀', '⭐'];

  return (
    <div className="art-studio-overlay" style={{
      background: emotionTheme.colors.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Emotion Theme Change Feedback */}
      {showEmotionFeedback && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(45deg, ${emotionTheme.colors.accent}, ${emotionTheme.colors.primary})`,
          color: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          textAlign: 'center',
          zIndex: 1000,
          animation: 'emotionFeedback 3s ease-out forwards',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {emotionThemes[currentEmotion]?.particles || '🎯'}
          </div>
          <div>Art colors changed to match your mood!</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
            {emotionTheme.description}
          </div>
        </div>
      )}

      {/* Current Emotion Display */}
      {isEmotionDetectionActive && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '15px',
          padding: '0.8rem 1rem',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 100,
          color: 'white'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{emotionThemes[currentEmotion]?.particles || '🎯'}</span>
          <span>Mood: {currentEmotion}</span>
        </div>
      )}

      <div className="art-studio-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        color: emotionTheme.colors.text || '#333'
      }}>
        {/* Header */}
        <div className="art-studio-header" style={{
          background: `linear-gradient(45deg, ${emotionTheme.colors.primary}, ${emotionTheme.colors.accent})`,
          color: 'white'
        }}>
          <h2>🎨 Art Studio</h2>
          <p>Create amazing artwork, {user?.childName || 'Artist'}! {emotionThemes[currentEmotion]?.particles || '🌟'}</p>
          <button className="close-btn" onClick={handleClose} style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="art-studio-content">
          {/* Toolbar */}
          <div className="toolbar">
            {/* Tools */}
            <div className="tool-section">
              <h4>🛠️ Tools</h4>
              <div className="tool-buttons">                <button 
                  className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                  onClick={() => {
                    setTool('brush');
                    setToolsUsed(prev => new Set([...prev, 'brush']));
                  }}
                  title="Brush"
                >
                  ✏️
                </button>
                <button 
                  className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                  onClick={() => {
                    setTool('eraser');
                    setToolsUsed(prev => new Set([...prev, 'eraser']));
                  }}
                  title="Eraser"
                >
                  <Eraser size={20} />
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="tool-section">
              <h4>🎨 Colors</h4>
              <div className="color-palette">                {colors.slice(0, 10).map((color, index) => (
                  <button
                    key={index}
                    className={`color-btn ${currentColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCurrentColor(color);
                      setColorsUsed(prev => new Set([...prev, color]));
                    }}
                  />
                ))}
                <button 
                  className="color-btn more-colors"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  +
                </button>
              </div>
              
              {showColorPicker && (
                <div className="extended-palette">                  {colors.slice(10).map((color, index) => (
                    <button
                      key={index}
                      className={`color-btn ${currentColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setCurrentColor(color);
                        setColorsUsed(prev => new Set([...prev, color]));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Brush Size */}
            <div className="tool-section">
              <h4>📏 Size</h4>
              <div className="size-controls">
                <button onClick={() => setBrushSize(Math.max(1, brushSize - 1))}>
                  <Minus size={16} />
                </button>
                <span className="size-display">{brushSize}</span>
                <button onClick={() => setBrushSize(Math.min(20, brushSize + 1))}>
                  <Plus size={16} />
                </button>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="size-slider"
              />
            </div>

            {/* Stickers */}
            <div className="tool-section">
              <h4>✨ Stickers</h4>
              <div className="stickers-grid">
                {stickers.map((sticker, index) => (
                  <button
                    key={index}
                    className="sticker-btn"
                    onClick={() => addSticker(sticker)}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="tool-section">
              <h4>🔧 Actions</h4>
              <div className="action-buttons">
                <button className="action-btn clear" onClick={clearCanvas}>
                  <RotateCcw size={16} />
                  Clear
                </button>
                <button className="action-btn download" onClick={downloadArt}>
                  <Download size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-area">
            <canvas
              ref={canvasRef}
              className="drawing-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="canvas-info">
              <p>Current Tool: <strong>{tool === 'brush' ? '✏️ Brush' : '🧽 Eraser'}</strong></p>
              <p>Color: <span style={{ color: currentColor, fontWeight: 'bold' }}>●</span></p>
              <p>Size: <strong>{brushSize}px</strong></p>
            </div>
          </div>
        </div>

        {/* Fun Encouragement */}
        <div className="encouragement" style={{
          background: `linear-gradient(45deg, ${emotionTheme.colors.secondary}, ${emotionTheme.colors.accent})`,
          color: 'white'
        }}>
          <p>{emotionThemes[currentEmotion]?.particles || '🌟'} You're such a talented artist! Keep creating amazing things! 🎨</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes emotionFeedback {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ArtStudio;
