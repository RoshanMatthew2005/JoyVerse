// import React, { useState, useRef, useEffect } from 'react';
// import { Palette, Brush, Eraser, Download, RotateCcw, Sun, Moon, Sparkles, Heart, Star, Circle, Droplets, Zap, Paintbrush2 } from 'lucide-react';
// import './App.css';

// const App = () => {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [currentTool, setCurrentTool] = useState('brush');
//   const [brushSize, setBrushSize] = useState(5);
//   const [currentColor, setCurrentColor] = useState('#ff6b6b');
//   const [theme, setTheme] = useState('sunset');
//   const [isDayMode, setIsDayMode] = useState(true);
//   const [showEncouragement, setShowEncouragement] = useState(false);
//   const [lastPoint, setLastPoint] = useState(null);

//   const themes = {
//     sunset: {
//       name: '🌅 Sunset Magic',
//       day: {
//         gradient: 'from-orange-300 via-pink-400 to-purple-500',
//         accent: 'from-yellow-400 to-orange-500',
//         text: 'text-white',
//         card: 'bg-white/30 backdrop-blur-sm border border-white/40'
//       },
//       night: {
//         gradient: 'from-orange-900 via-purple-900 to-indigo-900',
//         accent: 'from-orange-600 to-red-700',
//         text: 'text-white',
//         card: 'bg-black/30 backdrop-blur-sm border border-white/20'
//       }
//     },
//     ocean: {
//       name: '🌊 Ocean Dreams',
//       day: {
//         gradient: 'from-blue-300 via-cyan-400 to-teal-500',
//         accent: 'from-blue-300 to-cyan-400',
//         text: 'text-white',
//         card: 'bg-white/30 backdrop-blur-sm border border-white/40'
//       },
//       night: {
//         gradient: 'from-blue-900 via-indigo-900 to-slate-900',
//         accent: 'from-blue-600 to-cyan-700',
//         text: 'text-white',
//         card: 'bg-black/30 backdrop-blur-sm border border-white/20'
//       }
//     },
//     forest: {
//       name: '🌲 Forest Adventure',
//       day: {
//         gradient: 'from-green-300 via-emerald-400 to-green-600',
//         accent: 'from-lime-400 to-green-500',
//         text: 'text-white',
//         card: 'bg-white/30 backdrop-blur-sm border border-white/40'
//       },
//       night: {
//         gradient: 'from-green-900 via-emerald-900 to-slate-900',
//         accent: 'from-green-600 to-emerald-700',
//         text: 'text-white',
//         card: 'bg-black/30 backdrop-blur-sm border border-white/20'
//       }
//     },
//     galaxy: {
//       name: '✨ Galaxy Explorer',
//       day: {
//         gradient: 'from-purple-400 via-blue-500 to-indigo-600',
//         accent: 'from-purple-400 to-pink-500',
//         text: 'text-white',
//         card: 'bg-white/25 backdrop-blur-sm border border-white/40'
//       },
//       night: {
//         gradient: 'from-purple-900 via-blue-900 to-black',
//         accent: 'from-purple-600 to-pink-700',
//         text: 'text-white',
//         card: 'bg-black/40 backdrop-blur-sm border border-white/20'
//       }
//     },
//     rainbow: {
//       name: '🌈 Rainbow Joy',
//       day: {
//         gradient: 'from-red-300 via-yellow-300 via-green-300 via-blue-300 to-purple-400',
//         accent: 'from-pink-400 to-rose-500',
//         text: 'text-white',
//         card: 'bg-white/35 backdrop-blur-sm border border-white/50'
//       },
//       night: {
//         gradient: 'from-red-800 via-yellow-800 via-green-800 via-blue-800 to-purple-800',
//         accent: 'from-pink-600 to-rose-700',
//         text: 'text-white',
//         card: 'bg-black/35 backdrop-blur-sm border border-white/30'
//       }
//     }
//   };

//   const currentTheme = themes[theme][isDayMode ? 'day' : 'night'];

//   const drawingTools = [
//     { id: 'brush', name: '🖌️ Paint Brush', icon: Brush, style: 'smooth' },
//     { id: 'pencil', name: '✏️ Pencil', icon: Paintbrush2, style: 'sharp' },
//     { id: 'crayon', name: '🖍️ Crayon', icon: Zap, style: 'textured' },
//     { id: 'marker', name: '🖊️ Marker', icon: Droplets, style: 'bold' },
//     { id: 'watercolor', name: '🎨 Watercolor', icon: Palette, style: 'watercolor' },
//     { id: 'spray', name: '💨 Spray Paint', icon: Sparkles, style: 'spray' },
//     { id: 'eraser', name: '🧽 Eraser', icon: Eraser, style: 'erase' }
//   ];

//   const colors = [
//     '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
//     '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
//     '#3742fa', '#2f3542', '#ff4757', '#7bed9f', '#70a1ff',
//     '#ff3838', '#ff9500', '#ffdd59', '#32ff7e', '#18dcff',
//     '#7d5fff', '#ff5e5b', '#00b8d4', '#69f0ae', '#ffc107'
//   ];

//   const encouragements = [
//     "Amazing artwork! 🎨", "You're so creative! ✨", "Beautiful colors! 🌈",
//     "Keep going, artist! 🎭", "Wonderful imagination! 💫", "You're doing great! ⭐",
//     "Such talent! 🌟", "Beautiful creation! 🎪", "Outstanding work! 🏆"
//   ];

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
    
//     canvas.width = 900;
//     canvas.height = 650;
    
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
    
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
//   }, []);

//   const getToolSettings = (tool) => {
//     switch(tool) {
//       case 'pencil':
//         return { lineWidth: brushSize * 0.8, globalAlpha: 0.8, lineCap: 'round' };
//       case 'crayon':
//         return { lineWidth: brushSize * 1.5, globalAlpha: 0.7, lineCap: 'round' };
//       case 'marker':
//         return { lineWidth: brushSize * 1.2, globalAlpha: 0.9, lineCap: 'round' };
//       case 'watercolor':
//         return { lineWidth: brushSize * 2, globalAlpha: 0.3, lineCap: 'round' };
//       case 'spray':
//         return { lineWidth: brushSize * 3, globalAlpha: 0.1, lineCap: 'round' };
//       default:
//         return { lineWidth: brushSize, globalAlpha: 1, lineCap: 'round' };
//     }
//   };

//   const startDrawing = (e) => {
//     setIsDrawing(true);
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     setLastPoint({ x, y });
    
//     const ctx = canvas.getContext('2d');
//     ctx.beginPath();
//     ctx.moveTo(x, y);
    
//     if (Math.random() > 0.85) {
//       setShowEncouragement(true);
//       setTimeout(() => setShowEncouragement(false), 2000);
//     }
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;
    
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     const ctx = canvas.getContext('2d');
//     const settings = getToolSettings(currentTool);
    
//     if (currentTool === 'eraser') {
//       ctx.globalCompositeOperation = 'destination-out';
//       ctx.lineWidth = brushSize * 2;
//       ctx.globalAlpha = 1;
//     } else {
//       ctx.globalCompositeOperation = 'source-over';
//       ctx.strokeStyle = currentColor;
//       ctx.lineWidth = settings.lineWidth;
//       ctx.globalAlpha = settings.globalAlpha;
//       ctx.lineCap = settings.lineCap;
//     }

//     if (currentTool === 'spray') {
//       // Spray paint effect
//       for (let i = 0; i < 20; i++) {
//         const offsetX = (Math.random() - 0.5) * brushSize * 2;
//         const offsetY = (Math.random() - 0.5) * brushSize * 2;
//         ctx.fillStyle = currentColor;
//         ctx.globalAlpha = Math.random() * 0.3;
//         ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
//       }
//     } else if (currentTool === 'crayon') {
//       // Crayon texture effect
//       const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
//       for (let i = 0; i < distance; i += 2) {
//         const t = i / distance;
//         const px = lastPoint.x + (x - lastPoint.x) * t;
//         const py = lastPoint.y + (y - lastPoint.y) * t;
        
//         ctx.globalAlpha = 0.3 + Math.random() * 0.4;
//         ctx.beginPath();
//         ctx.arc(px + (Math.random() - 0.5) * 3, py + (Math.random() - 0.5) * 3, brushSize * 0.5, 0, Math.PI * 2);
//         ctx.fill();
//       }
//     } else {
//       // Regular drawing
//       ctx.lineTo(x, y);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(x, y);
//     }
    
//     setLastPoint({ x, y });
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//     setLastPoint(null);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctx.globalAlpha = 1;
//     ctx.globalCompositeOperation = 'source-over';
//     ctx.fillStyle = 'white';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };

//   const downloadArt = () => {
//     const canvas = canvasRef.current;
//     const link = document.createElement('a');
//     link.download = 'my-masterpiece.png';
//     link.href = canvas.toDataURL();
//     link.click();
    
//     setShowEncouragement(true);
//     setTimeout(() => setShowEncouragement(false), 3000);
//   };

//   const addStamp = (shape) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;
    
//     ctx.globalAlpha = 1;
//     ctx.globalCompositeOperation = 'source-over';
//     ctx.fillStyle = currentColor;
//     ctx.strokeStyle = currentColor;
//     ctx.lineWidth = 3;
    
//     switch(shape) {
//       case 'heart':
//         ctx.beginPath();
//         ctx.arc(centerX - 15, centerY - 8, 15, 0, Math.PI * 2);
//         ctx.arc(centerX + 15, centerY - 8, 15, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.beginPath();
//         ctx.moveTo(centerX - 30, centerY);
//         ctx.lineTo(centerX, centerY + 30);
//         ctx.lineTo(centerX + 30, centerY);
//         ctx.fill();
//         break;
//       case 'star':
//         ctx.beginPath();
//         for(let i = 0; i < 5; i++) {
//           const angle = (i * 4 * Math.PI) / 5;
//           const x = centerX + Math.cos(angle) * 25;
//           const y = centerY + Math.sin(angle) * 25;
//           if(i === 0) ctx.moveTo(x, y);
//           else ctx.lineTo(x, y);
//         }
//         ctx.closePath();
//         ctx.fill();
//         break;
//       case 'circle':
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
//         ctx.fill();
//         break;
//       case 'flower':
//         for(let i = 0; i < 8; i++) {
//           ctx.beginPath();
//           const angle = (i * Math.PI) / 4;
//           const x = centerX + Math.cos(angle) * 20;
//           const y = centerY + Math.sin(angle) * 20;
//           ctx.arc(x, y, 8, 0, Math.PI * 2);
//           ctx.fill();
//         }
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
//         ctx.fillStyle = '#FFD700';
//         ctx.fill();
//         break;
//       case 'rainbow':
//         const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff', '#8800ff'];
//         for(let i = 0; i < colors.length; i++) {
//           ctx.strokeStyle = colors[i];
//           ctx.lineWidth = 8;
//           ctx.beginPath();
//           ctx.arc(centerX, centerY + 20, 40 + i * 8, Math.PI, 0);
//           ctx.stroke();
//         }
//         break;
//     }
//   };

//   const nightModeShapes = isDayMode ? ['⭐', '🎨', '🌈', '✨', '🎭'] : ['🌙', '⭐', '✨', '🌟', '💫'];

//   return (
//     <div className={`app-container ${isDayMode ? 'day-mode' : 'night-mode'} theme-${theme}`}>
//       {/* Floating shapes animation */}
//       <div className="floating-shapes">
//         {[...Array(12)].map((_, i) => (
//           <div
//             key={i}
//             className="floating-shape"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${i * 0.5}s`,
//               animationDuration: `${3 + Math.random() * 2}s`
//             }}
//           >
//             {nightModeShapes[i % nightModeShapes.length]}
//           </div>
//         ))}
//       </div>

//       {/* Day/Night Toggle */}
//       <div className="theme-toggle">
//         <button
//           onClick={() => setIsDayMode(!isDayMode)}
//           className={`toggle-button ${isDayMode ? 'day' : 'night'}`}
//         >
//           {isDayMode ? (
//             <Moon className="toggle-icon pulse" />
//           ) : (
//             <Sun className="toggle-icon spin-slow" />
//           )}
//         </button>
//       </div>

//       {/* Encouragement popup */}
//       {showEncouragement && (
//         <div className="encouragement-popup bounce">
//           <div className={`encouragement-card ${isDayMode ? 'day' : 'night'}`}>
//             <p className="encouragement-text">
//               {encouragements[Math.floor(Math.random() * encouragements.length)]}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="main-container">
//         {/* Header */}
//         <div className="header fade-in">
//           <h1 className={`header-title ${isDayMode ? 'day' : 'night'} pulse`}>
//             � My Art Studio 🎨
//           </h1>
//           <p className={`header-subtitle ${isDayMode ? 'day' : 'night'}`}>
//             Create amazing art with professional tools! {isDayMode ? '☀️' : '🌙'}
//           </p>
//         </div>

//         {/* Theme Selector */}
//         <div className={`theme-selector slide-up ${isDayMode ? 'day' : 'night'}`}>
//           <h3 className={`selector-title ${isDayMode ? 'day' : 'night'}`}>
//             <Palette className="spin-slow" />
//             Choose Your Magic Theme
//           </h3>
//           <div className="theme-grid">
//             {Object.entries(themes).map(([key, themeData]) => (
//               <button
//                 key={key}
//                 onClick={() => setTheme(key)}
//                 className={`theme-button ${theme === key ? 'active' : ''} ${isDayMode ? 'day' : 'night'} gradient-shift`}
//               >
//                 {themeData.name}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="content-grid">
//           {/* Tools Panel */}
//           <div className="tools-panel">
//             {/* Drawing Tools */}
//             <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`}>
//               <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>
//                 <Brush className="bounce" />
//                 Art Tools
//               </h3>
//               <div className="tools-grid">
//                 {drawingTools.map((tool) => {
//                   const IconComponent = tool.icon;
//                   return (
//                     <button
//                       key={tool.id}
//                       onClick={() => setCurrentTool(tool.id)}
//                       className={`tool-button ${currentTool === tool.id ? 'active' : ''} ${isDayMode ? 'day' : 'night'}`}
//                     >
//                       <IconComponent className="tool-icon" />
//                       <span className="tool-name">{tool.name}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Brush Size */}
//             <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.1s'}}>
//               <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>✨ Tool Size</h3>
//               <div className="size-controls">
//                 <input
//                   type="range"
//                   min="1"
//                   max="25"
//                   value={brushSize}
//                   onChange={(e) => setBrushSize(e.target.value)}
//                   className="size-slider"
//                 />
//                 <div className="size-preview">
//                   <div 
//                     className="size-indicator"
//                     style={{ 
//                       width: `${Math.max(12, brushSize * 2)}px`, 
//                       height: `${Math.max(12, brushSize * 2)}px`,
//                       backgroundColor: currentColor 
//                     }}
//                   />
//                   <p className={`size-text ${isDayMode ? 'day' : 'night'}`}>Size: {brushSize}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Colors */}
//             <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.2s'}}>
//               <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🌈 Color Palette</h3>
//               <div className="colors-grid">
//                 {colors.map((color, index) => (
//                   <button
//                     key={color}
//                     onClick={() => setCurrentColor(color)}
//                     className={`color-button ${currentColor === color ? 'active' : ''} color-pulse`}
//                     style={{ 
//                       backgroundColor: color,
//                       animationDelay: `${index * 0.05}s`
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>

//             {/* Fun Stamps */}
//             <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.3s'}}>
//               <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🎭 Fun Stamps</h3>
//               <div className="stamps-grid">
//                 {[
//                   { id: 'heart', emoji: '💖' },
//                   { id: 'star', emoji: '⭐' },
//                   { id: 'circle', emoji: '⭕' },
//                   { id: 'flower', emoji: '🌸' },
//                   { id: 'rainbow', emoji: '🌈' }
//                 ].map((stamp) => (
//                   <button
//                     key={stamp.id}
//                     onClick={() => addStamp(stamp.id)}
//                     className={`stamp-button ${isDayMode ? 'day' : 'night'}`}
//                   >
//                     {stamp.emoji}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.4s'}}>
//               <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🎯 Actions</h3>
//               <div className="action-buttons">
//                 <button
//                   onClick={clearCanvas}
//                   className={`action-button clear ${isDayMode ? 'day' : 'night'} pulse-subtle`}
//                 >
//                   🗑️ Clear Canvas
//                 </button>
//                 <button
//                   onClick={downloadArt}
//                   className={`action-button save ${isDayMode ? 'day' : 'night'} shimmer`}
//                 >
//                   💾 Save My Art
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Canvas Area */}
//           <div className="canvas-area">
//             <div className={`canvas-section slide-right ${isDayMode ? 'day' : 'night'}`}>
//               <h3 className={`canvas-title ${isDayMode ? 'day' : 'night'}`}>
//                 <Sparkles className="twinkle" />
//                 Your Amazing Canvas
//                 <Sparkles className="twinkle" style={{animationDelay: '0.5s'}} />
//               </h3>
//               <div className="canvas-container">
//                 <canvas
//                   ref={canvasRef}
//                   onMouseDown={startDrawing}
//                   onMouseMove={draw}
//                   onMouseUp={stopDrawing}
//                   onMouseLeave={stopDrawing}
//                   className="drawing-canvas"
//                 />
//               </div>
//               <div className={`canvas-footer ${isDayMode ? 'day' : 'night'}`}>
//                 <p className={`footer-text ${isDayMode ? 'day' : 'night'}`}>
//                   🎨 Selected Tool: <span className="footer-highlight">{drawingTools.find(t => t.id === currentTool)?.name}</span>
//                 </p>
//                 <p className={`footer-subtext ${isDayMode ? 'day' : 'night'}`}>
//                   Click and drag to create your masterpiece! ✨
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Brush, Eraser, Download, RotateCcw, Sun, Moon, Sparkles, Heart, Star, Circle, Droplets, Zap, Paintbrush2 } from 'lucide-react';
import './App.css';

const App = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [currentColor, setCurrentColor] = useState('#ff6b6b');
  const [theme, setTheme] = useState('sunset');
  const [isDayMode, setIsDayMode] = useState(true);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);

  const themes = {
    sunset: {
      name: '🌅 Sunset Magic',
      day: {
        gradient: 'from-orange-300 via-pink-400 to-purple-500',
        accent: 'from-yellow-400 to-orange-500',
        text: 'text-white',
        card: 'bg-white/30 backdrop-blur-sm border border-white/40'
      },
      night: {
        gradient: 'from-orange-900 via-purple-900 to-indigo-900',
        accent: 'from-orange-600 to-red-700',
        text: 'text-white',
        card: 'bg-black/30 backdrop-blur-sm border border-white/20'
      }
    },
    ocean: {
      name: '🌊 Ocean Dreams',
      day: {
        gradient: 'from-blue-300 via-cyan-400 to-teal-500',
        accent: 'from-blue-300 to-cyan-400',
        text: 'text-white',
        card: 'bg-white/30 backdrop-blur-sm border border-white/40'
      },
      night: {
        gradient: 'from-blue-900 via-indigo-900 to-slate-900',
        accent: 'from-blue-600 to-cyan-700',
        text: 'text-white',
        card: 'bg-black/30 backdrop-blur-sm border border-white/20'
      }
    },
    forest: {
      name: '🌲 Forest Adventure',
      day: {
        gradient: 'from-green-300 via-emerald-400 to-green-600',
        accent: 'from-lime-400 to-green-500',
        text: 'text-white',
        card: 'bg-white/30 backdrop-blur-sm border border-white/40'
      },
      night: {
        gradient: 'from-green-900 via-emerald-900 to-slate-900',
        accent: 'from-green-600 to-emerald-700',
        text: 'text-white',
        card: 'bg-black/30 backdrop-blur-sm border border-white/20'
      }
    },
    galaxy: {
      name: '✨ Galaxy Explorer',
      day: {
        gradient: 'from-purple-400 via-blue-500 to-indigo-600',
        accent: 'from-purple-400 to-pink-500',
        text: 'text-white',
        card: 'bg-white/25 backdrop-blur-sm border border-white/40'
      },
      night: {
        gradient: 'from-purple-900 via-blue-900 to-black',
        accent: 'from-purple-600 to-pink-700',
        text: 'text-white',
        card: 'bg-black/40 backdrop-blur-sm border border-white/20'
      }
    },
    rainbow: {
      name: '🌈 Rainbow Joy',
      day: {
        gradient: 'from-red-300 via-yellow-300 via-green-300 via-blue-300 to-purple-400',
        accent: 'from-pink-400 to-rose-500',
        text: 'text-white',
        card: 'bg-white/35 backdrop-blur-sm border border-white/50'
      },
      night: {
        gradient: 'from-red-800 via-yellow-800 via-green-800 via-blue-800 to-purple-800',
        accent: 'from-pink-600 to-rose-700',
        text: 'text-white',
        card: 'bg-black/35 backdrop-blur-sm border border-white/30'
      }
    }
  };

  const currentTheme = themes[theme][isDayMode ? 'day' : 'night'];

  const drawingTools = [
    { id: 'brush', name: '🖌️ Paint Brush', icon: Brush, style: 'smooth' },
    { id: 'pencil', name: '✏️ Pencil', icon: Paintbrush2, style: 'sharp' },
    { id: 'crayon', name: '🖍️ Crayon', icon: Zap, style: 'textured' },
    { id: 'marker', name: '🖊️ Marker', icon: Droplets, style: 'bold' },
    { id: 'watercolor', name: '🎨 Watercolor', icon: Palette, style: 'watercolor' },
    { id: 'spray', name: '💨 Spray Paint', icon: Sparkles, style: 'spray' },
    { id: 'eraser', name: '🧽 Eraser', icon: Eraser, style: 'erase' }
  ];

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#3742fa', '#2f3542', '#ff4757', '#7bed9f', '#70a1ff',
    '#ff3838', '#ff9500', '#ffdd59', '#32ff7e', '#18dcff',
    '#7d5fff', '#ff5e5b', '#00b8d4', '#69f0ae', '#ffc107'
  ];

  const encouragements = [
    "Amazing artwork! 🎨", "You're so creative! ✨", "Beautiful colors! 🌈",
    "Keep going, artist! 🎭", "Wonderful imagination! 💫", "You're doing great! ⭐",
    "Such talent! 🌟", "Beautiful creation! 🎪", "Outstanding work! 🏆"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 900;
    canvas.height = 650;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getToolSettings = (tool) => {
    switch(tool) {
      case 'pencil':
        return { lineWidth: brushSize * 0.8, globalAlpha: 0.8, lineCap: 'round' };
      case 'crayon':
        return { lineWidth: brushSize * 1.5, globalAlpha: 0.7, lineCap: 'round' };
      case 'marker':
        return { lineWidth: brushSize * 1.2, globalAlpha: 0.9, lineCap: 'round' };
      case 'watercolor':
        return { lineWidth: brushSize * 2, globalAlpha: 0.3, lineCap: 'round' };
      case 'spray':
        return { lineWidth: brushSize * 3, globalAlpha: 0.1, lineCap: 'round' };
      default:
        return { lineWidth: brushSize, globalAlpha: 1, lineCap: 'round' };
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPoint({ x, y });
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (Math.random() > 0.85) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 2000);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    const settings = getToolSettings(currentTool);
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.globalAlpha = 1;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = settings.lineWidth;
      ctx.globalAlpha = settings.globalAlpha;
      ctx.lineCap = settings.lineCap;
    }

    if (currentTool === 'spray') {
      // Spray paint effect
      for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * brushSize * 2;
        const offsetY = (Math.random() - 0.5) * brushSize * 2;
        ctx.fillStyle = currentColor;
        ctx.globalAlpha = Math.random() * 0.3;
        ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    } else if (currentTool === 'crayon') {
      // Crayon texture effect
      const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
      for (let i = 0; i < distance; i += 2) {
        const t = i / distance;
        const px = lastPoint.x + (x - lastPoint.x) * t;
        const py = lastPoint.y + (y - lastPoint.y) * t;
        
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.arc(px + (Math.random() - 0.5) * 3, py + (Math.random() - 0.5) * 3, brushSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Regular drawing
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'my-masterpiece.png';
    link.href = canvas.toDataURL();
    link.click();
    
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  };

  const addStamp = (shape) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    
    switch(shape) {
      case 'heart':
        ctx.beginPath();
        ctx.arc(centerX - 15, centerY - 8, 15, 0, Math.PI * 2);
        ctx.arc(centerX + 15, centerY - 8, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY);
        ctx.lineTo(centerX, centerY + 30);
        ctx.lineTo(centerX + 30, centerY);
        ctx.fill();
        break;
      case 'star':
        ctx.beginPath();
        for(let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5;
          const x = centerX + Math.cos(angle) * 25;
          const y = centerY + Math.sin(angle) * 25;
          if(i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'flower':
        for(let i = 0; i < 8; i++) {
          ctx.beginPath();
          const angle = (i * Math.PI) / 4;
          const x = centerX + Math.cos(angle) * 20;
          const y = centerY + Math.sin(angle) * 20;
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        break;
      case 'rainbow':
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff', '#8800ff'];
        for(let i = 0; i < colors.length; i++) {
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(centerX, centerY + 20, 40 + i * 8, Math.PI, 0);
          ctx.stroke();
        }
        break;
    }
  };

  const nightModeShapes = isDayMode ? ['⭐', '🎨', '🌈', '✨', '🎭'] : ['🌙', '⭐', '✨', '🌟', '💫'];

  return (
    <div className={`app-container ${isDayMode ? 'day-mode' : 'night-mode'} theme-${theme}`}>
      {/* Floating shapes animation */}
      <div className="floating-shapes">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="floating-shape"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {nightModeShapes[i % nightModeShapes.length]}
          </div>
        ))}
      </div>

      {/* Day/Night Toggle */}
      <div className="theme-toggle">
        <button
          onClick={() => setIsDayMode(!isDayMode)}
          className={`toggle-button ${isDayMode ? 'day' : 'night'}`}
        >
          {isDayMode ? (
            <Moon className="toggle-icon pulse" />
          ) : (
            <Sun className="toggle-icon spin-slow" />
          )}
        </button>
      </div>

      {/* Encouragement popup */}
      {showEncouragement && (
        <div className="encouragement-popup bounce">
          <div className={`encouragement-card ${isDayMode ? 'day' : 'night'}`}>
            <p className="encouragement-text">
              {encouragements[Math.floor(Math.random() * encouragements.length)]}
            </p>
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Header */}
        <div className="header fade-in">
          <h1 className={`header-title ${isDayMode ? 'day' : 'night'} pulse`}>
            � My Art Studio 🎨
          </h1>
          <p className={`header-subtitle ${isDayMode ? 'day' : 'night'}`}>
            Create amazing art with professional tools! {isDayMode ? '☀️' : '🌙'}
          </p>
        </div>

        {/* Theme Selector */}
        <div className={`theme-selector slide-up ${isDayMode ? 'day' : 'night'}`}>
          <h3 className={`selector-title ${isDayMode ? 'day' : 'night'}`}>
            <Palette className="spin-slow" />
            Choose Your Magic Theme
          </h3>
          <div className="theme-grid">
            {Object.entries(themes).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`theme-button ${theme === key ? 'active' : ''} ${isDayMode ? 'day' : 'night'} gradient-shift`}
              >
                {themeData.name}
              </button>
            ))}
          </div>
        </div>

        <div className="content-grid">
          {/* Tools Panel */}
          <div className="tools-panel">
            {/* Drawing Tools */}
            <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`}>
              <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>
                <Brush className="bounce" />
                Art Tools
              </h3>
              <div className="tools-grid">
                {drawingTools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setCurrentTool(tool.id)}
                      className={`tool-button ${currentTool === tool.id ? 'active' : ''} ${isDayMode ? 'day' : 'night'}`}
                    >
                      <IconComponent className="tool-icon" />
                      <span className="tool-name">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brush Size */}
            <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.1s'}}>
              <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>✨ Tool Size</h3>
              <div className="size-controls">
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={brushSize}
                  onChange={(e) => setBrushSize(e.target.value)}
                  className="size-slider"
                />
                <div className="size-preview">
                  <div 
                    className="size-indicator"
                    style={{ 
                      width: `${Math.max(12, brushSize * 2)}px`, 
                      height: `${Math.max(12, brushSize * 2)}px`,
                      backgroundColor: currentColor 
                    }}
                  />
                  <p className={`size-text ${isDayMode ? 'day' : 'night'}`}>Size: {brushSize}</p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.2s'}}>
              <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🌈 Color Palette</h3>
              <div className="colors-grid">
                {colors.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`color-button ${currentColor === color ? 'active' : ''} color-pulse`}
                    style={{ 
                      backgroundColor: color,
                      animationDelay: `${index * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fun Stamps */}
            <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.3s'}}>
              <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🎭 Fun Stamps</h3>
              <div className="stamps-grid">
                {[
                  { id: 'heart', emoji: '💖' },
                  { id: 'star', emoji: '⭐' },
                  { id: 'circle', emoji: '⭕' },
                  { id: 'flower', emoji: '🌸' },
                  { id: 'rainbow', emoji: '🌈' }
                ].map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => addStamp(stamp.id)}
                    className={`stamp-button ${isDayMode ? 'day' : 'night'}`}
                  >
                    {stamp.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`tool-section slide-left ${isDayMode ? 'day' : 'night'}`} style={{animationDelay: '0.4s'}}>
              <h3 className={`section-title ${isDayMode ? 'day' : 'night'}`}>🎯 Actions</h3>
              <div className="action-buttons">
                <button
                  onClick={clearCanvas}
                  className={`action-button clear ${isDayMode ? 'day' : 'night'} pulse-subtle`}
                >
                  🗑️ Clear Canvas
                </button>
                <button
                  onClick={downloadArt}
                  className={`action-button save ${isDayMode ? 'day' : 'night'} shimmer`}
                >
                  💾 Save My Art
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="canvas-area">
            <div className={`canvas-section slide-right ${isDayMode ? 'day' : 'night'}`}>
              <h3 className={`canvas-title ${isDayMode ? 'day' : 'night'}`}>
                <Sparkles className="twinkle" />
                Your Amazing Canvas
                <Sparkles className="twinkle" style={{animationDelay: '0.5s'}} />
              </h3>
              <div className="canvas-container">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="drawing-canvas"
                />
              </div>
              <div className={`canvas-footer ${isDayMode ? 'day' : 'night'}`}>
                <p className={`footer-text ${isDayMode ? 'day' : 'night'}`}>
                  🎨 Selected Tool: <span className="footer-highlight">{drawingTools.find(t => t.id === currentTool)?.name}</span>
                </p>
                <p className={`footer-subtext ${isDayMode ? 'day' : 'night'}`}>
                  Click and drag to create your masterpiece! ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;