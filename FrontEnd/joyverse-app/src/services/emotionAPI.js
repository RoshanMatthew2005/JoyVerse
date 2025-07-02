// Emotion Detection API Service
class EmotionDetectionService {
  constructor() {
    this.vitApiUrl = 'http://localhost:8001'; // Updated to match new FastAPI server port
    this.isCapturing = false;
    this.captureInterval = null;
    this.videoElement = null;
    this.canvas = null;
    this.stream = null;
    this.onEmotionDetected = null;
    this.lastEmotion = null;
    this.emotionHistory = [];
    
    // Add beforeunload event listener to cleanup camera when page is closed
    window.addEventListener('beforeunload', () => {
      this.stopEmotionDetection();
    });
    
    // Add visibility change listener to pause/resume when tab is hidden/visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isCapturing) {
        console.log('📱 Tab hidden, pausing emotion detection');
        this.pauseCapturing();
      } else if (!document.hidden && this.stream && !this.isCapturing) {
        console.log('📱 Tab visible, resuming emotion detection');
        this.resumeCapturing();
      }
    });
  }

  // Initialize camera and start emotion detection
  async startEmotionDetection(onEmotionCallback, showPreview = false) {
    try {
      console.log('🎯 === EMOTION DETECTION START SEQUENCE ===');
      
      // Always stop any existing detection first
      this.stopEmotionDetection();
      
      this.onEmotionDetected = onEmotionCallback;
      this.showPreview = showPreview;
      
      console.log('📷 Requesting camera permission...');
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera not supported on this device');
        throw new Error('Camera not supported on this device');
      }
      
      console.log('🔍 Checking camera devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log(`📹 Found ${videoDevices.length} video devices:`, videoDevices.map(d => d.label || 'Unknown'));
      
      // Request camera access with fresh permission request
      console.log('🚀 Requesting camera stream...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        }
      });

      console.log('✅ Camera permission granted, stream acquired');
      console.log('📊 Stream details:', {
        active: this.stream.active,
        id: this.stream.id,
        tracks: this.stream.getTracks().length
      });

      // Create video element
      console.log('🎥 Creating video element...');
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;

      // Create canvas for capture with higher resolution
      console.log('🖼️ Creating canvas...');
      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;

      // Wait for video to be ready
      console.log('⏳ Waiting for video to load...');
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded successfully');
          console.log('📊 Video dimensions:', {
            videoWidth: this.videoElement.videoWidth,
            videoHeight: this.videoElement.videoHeight,
            readyState: this.videoElement.readyState
          });
          resolve();
        };
        this.videoElement.onerror = (error) => {
          console.error('❌ Video error:', error);
          reject(error);
        };
        
        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Video loading timeout'));
        }, 10000);
      });

      // Add preview to DOM if requested
      if (showPreview) {
        console.log('🖥️ Adding camera preview to DOM...');
        this.addPreviewToDOM();
      }

      console.log('🎥 Starting capture and analysis...');
      this.isCapturing = true;
      
      // Wait 2 seconds before starting capture to let user get positioned
      console.log('⏱️ Waiting 2 seconds for user positioning...');
      setTimeout(() => {
        if (this.isCapturing) {
          console.log('📸 Beginning emotion detection capture sequence...');
          this.captureAndAnalyze();
          this.setCaptureInterval(2000); // Default 2 second intervals
          console.log('✅ Emotion detection fully started with 2-second intervals');
        } else {
          console.warn('⚠️ Emotion detection was stopped before capture could begin');
        }
      }, 2000);
      
      console.log('🎯 === EMOTION DETECTION INITIALIZATION COMPLETE ===');
      return true;
    } catch (error) {
      console.error('❌ Error starting emotion detection:', error);
      
      // More specific error messages
      if (error.name === 'NotAllowedError') {
        console.error('📷 Camera permission denied by user');
      } else if (error.name === 'NotFoundError') {
        console.error('📷 No camera found on device');
      } else if (error.name === 'NotReadableError') {
        console.error('📷 Camera is already in use by another application');
      } else if (error.name === 'OverconstrainedError') {
        console.error('📷 Camera constraints not satisfied');
      }
      
      this.stopEmotionDetection();
      return false;
    }
  }

  // Add preview to DOM
  addPreviewToDOM() {
    if (this.videoElement && this.showPreview) {
      // Remove any existing preview
      this.removePreviewFromDOM();
      
      // Create preview container
      this.previewContainer = document.createElement('div');
      this.previewContainer.id = 'emotion-camera-preview';
      this.previewContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 250px;
        height: 200px;
        border: 3px solid #4CAF50;
        border-radius: 15px;
        overflow: hidden;
        z-index: 10000;
        background: #000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      `;
      
      // Add instruction text
      const instruction = document.createElement('div');
      instruction.style.cssText = `
        position: absolute;
        top: -60px;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 10px;
        font-size: 14px;
        text-align: center;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-weight: bold;
      `;
      instruction.innerHTML = `
        <div>📹 Position Your Face Clearly</div>
        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">
          • Look directly at camera<br>
          • Ensure good lighting<br>
          • Keep face centered
        </div>
      `;
      
      // Add status indicator
      this.statusIndicator = document.createElement('div');
      this.statusIndicator.style.cssText = `
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 5px;
        font-size: 12px;
        text-align: center;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-weight: bold;
        z-index: 10001;
      `;
      this.statusIndicator.textContent = '🔍 Looking for face...';
      
      // Clone video element for preview
      this.previewVideo = this.videoElement.cloneNode();
      this.previewVideo.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1);
      `;
      this.previewVideo.srcObject = this.stream;
      this.previewVideo.autoplay = true;
      this.previewVideo.muted = true;
      this.previewVideo.playsInline = true;
      
      this.previewContainer.appendChild(instruction);
      this.previewContainer.appendChild(this.statusIndicator);
      this.previewContainer.appendChild(this.previewVideo);
      document.body.appendChild(this.previewContainer);
      
      // Auto-hide preview after 60 seconds (longer for debugging)
      this.previewTimeout = setTimeout(() => {
        this.removePreviewFromDOM();
      }, 60000);
      
      console.log('📹 Enhanced camera preview added to DOM');
    }
  }

  // Remove preview from DOM
  removePreviewFromDOM() {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
    
    if (this.previewContainer && this.previewContainer.parentNode) {
      this.previewContainer.parentNode.removeChild(this.previewContainer);
      this.previewContainer = null;
      this.previewVideo = null;
      this.statusIndicator = null;
      console.log('📹 Camera preview removed from DOM');
    }
  }

  // Update preview status
  updatePreviewStatus(message, isGood = false) {
    if (this.statusIndicator) {
      this.statusIndicator.style.background = isGood ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
      this.statusIndicator.textContent = message;
    }
  }

  // Start capturing images every 5 seconds
  startCapturing() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }

    // Capture immediately
    this.captureAndAnalyze();

    // Then capture every 2 seconds for more responsive feedback
    this.captureInterval = setInterval(() => {
      this.captureAndAnalyze();
    }, 2000);
  }

  // Capture image from video and send to ViT model
  async captureAndAnalyze() {
    if (!this.isCapturing || !this.videoElement || !this.canvas) {
      console.warn('⚠️ Cannot capture: missing components', {
        isCapturing: this.isCapturing,
        hasVideo: !!this.videoElement,
        hasCanvas: !!this.canvas,
        videoReadyState: this.videoElement?.readyState,
        streamActive: this.stream?.active
      });
      return;
    }

    try {
      console.log('📸 Starting image capture...');
      const ctx = this.canvas.getContext('2d');
      
      // Check video readiness
      if (this.videoElement.readyState < 2) {
        console.warn('⚠️ Video not ready for capture, readyState:', this.videoElement.readyState);
        return;
      }
      
      ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      console.log('🖼️ Image drawn to canvas');
      
      // Convert canvas to blob with higher quality
      const blob = await new Promise(resolve => {
        this.canvas.toBlob(resolve, 'image/jpeg', 0.95);
      });

      if (blob) {
        console.log('✅ Image blob created, size:', blob.size, 'bytes');
        const emotion = await this.sendImageToAPI(blob);
        if (emotion) {
          console.log('🎭 Emotion result received:', emotion);
          this.processEmotionResult(emotion);
        } else {
          console.warn('⚠️ No emotion result from API');
        }
      } else {
        console.error('❌ Failed to create image blob');
      }
    } catch (error) {
      console.error('❌ Error capturing and analyzing image:', error);
    }
  }

  // Send image to ViT model API
  async sendImageToAPI(imageBlob) {
    try {
      console.log('📤 Sending image to API...', {
        size: imageBlob.size,
        type: imageBlob.type,
        url: `${this.vitApiUrl}/predict`
      });

      const formData = new FormData();
      formData.append('file', imageBlob, 'capture.jpg');

      const response = await fetch(`${this.vitApiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 API Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🎯 Emotion detected:', result);
        
        // Update preview status based on result
        if (result.note && result.note.includes('no face detected')) {
          this.updatePreviewStatus('❌ No face detected - please adjust position', false);
        } else if (result.confidence < 0.3) {
          this.updatePreviewStatus('⚠️ Low confidence - improve lighting/position', false);
        } else {
          this.updatePreviewStatus(`✅ ${result.emotion} detected (${Math.round(result.confidence * 100)}%)`, true);
        }
        
        return result;
      } else {
        const errorData = await response.text();
        console.warn('⚠️ API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        this.updatePreviewStatus('❌ API Error - check server', false);
        
        // If it's a "No face detected" error, try again after a short delay
        if (response.status === 400 && errorData.includes('No face detected')) {
          console.log('👤 No face detected, will try again in next capture...');
        }
        
        return null;
      }
    } catch (error) {
      console.error('❌ Error sending image to API:', error);
      return null;
    }
  }

  // Process emotion result and trigger theme change
  processEmotionResult(emotionData) {
    if (!emotionData || !emotionData.emotion) {
      return;
    }

    const { emotion, confidence, probs } = emotionData;
    
    // Add to emotion history
    this.emotionHistory.push({
      emotion,
      confidence,
      timestamp: Date.now()
    });

    // Keep only last 10 emotions
    if (this.emotionHistory.length > 10) {
      this.emotionHistory.shift();
    }

    // More responsive emotion changes - very low threshold for testing
    const confidenceThreshold = 0.05; // Very low threshold to catch even default emotions
    const shouldChange = emotion !== this.lastEmotion && confidence > confidenceThreshold;
    const forceChange = confidence > 0.3; // Force change for moderate confidence
    
    if (shouldChange || forceChange) {
      this.lastEmotion = emotion;
      
      if (this.onEmotionDetected) {
        this.onEmotionDetected({
          emotion,
          confidence,
          probs,
          history: this.emotionHistory
        });
      }
    } else {
      console.log(`🎭 Emotion ${emotion} (${Math.round(confidence * 100)}%) - threshold not met or same as last`);
    }
  }

  // Set capture interval dynamically
  setCaptureInterval(intervalMs) {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    
    if (this.isCapturing) {
      this.captureInterval = setInterval(() => {
        this.captureAndAnalyze();
      }, intervalMs);
    }
  }

  // Enable fast mode (1 second intervals)
  enableFastMode() {
    console.log('⚡ Fast mode enabled - 1 second intervals');
    this.setCaptureInterval(1000);
  }

  // Enable normal mode (2 second intervals)
  enableNormalMode() {
    console.log('🐌 Normal mode enabled - 2 second intervals');
    this.setCaptureInterval(2000);
  }

  // Get the most frequent emotion from recent history
  getDominantEmotion() {
    if (this.emotionHistory.length === 0) {
      return null;
    }

    const recentEmotions = this.emotionHistory.slice(-5); // Last 5 emotions
    const emotionCounts = {};
    
    recentEmotions.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    let dominantEmotion = null;
    let maxCount = 0;
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  // Stop emotion detection and cleanup
  stopEmotionDetection() {
    this.isCapturing = false;

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('📷 Camera track stopped:', track.kind);
      });
      this.stream = null;
    }

    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.srcObject = null;
      document.body.removeChild(this.videoElement);
      this.videoElement = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      document.body.removeChild(this.canvas);
      this.canvas = null;
    }

    this.onEmotionDetected = null;
    this.lastEmotion = null;
    this.emotionHistory = [];
    
    console.log('🛑 Emotion detection stopped and camera released');
  }

  // Pause capturing (when tab is hidden)
  pauseCapturing() {
    this.isCapturing = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
  }

  // Resume capturing (when tab becomes visible)
  resumeCapturing() {
    if (this.stream && this.videoElement && !this.isCapturing) {
      this.isCapturing = true;
      this.startCapturing();
    }
  }

  // Get current emotion status
  getEmotionStatus() {
    return {
      isCapturing: this.isCapturing,
      lastEmotion: this.lastEmotion,
      emotionHistory: this.emotionHistory,
      dominantEmotion: this.getDominantEmotion(),
      hasVideo: !!this.videoElement,
      hasStream: !!this.stream,
      streamActive: this.stream?.active || false,
      videoReadyState: this.videoElement?.readyState || 'unknown'
    };
  }

  // Public method to manually trigger capture (for testing)
  async manualCapture() {
    return await this.captureAndAnalyze();
  }

  // Test API connection
  async testAPIConnection() {
    try {
      console.log('🔌 Testing API connection...');
      const response = await fetch(`${this.vitApiUrl}/test`);
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Connection successful:', result);
        return { success: true, message: result.message };
      } else {
        console.error('❌ API connection failed:', response.status);
        return { success: false, message: `API connection failed: ${response.status}` };
      }
    } catch (error) {
      console.error('❌ API connection error:', error);
      return { success: false, message: `Cannot connect to API: ${error.message}` };
    }
  }
}

// Create singleton instance
const emotionDetectionService = new EmotionDetectionService();

export default emotionDetectionService;
