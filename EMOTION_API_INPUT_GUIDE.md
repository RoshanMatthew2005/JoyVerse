# 📸 JoyVerse Emotion API - Input Requirements Guide

## 🎯 **Simple Answer: Games Send IMAGES ONLY**

Your games should send **only image files** to the emotion recognition API. The backend automatically handles all the complex processing.

## 📋 **What Games Should Send**

### ✅ **Correct Input Format:**
```javascript
// Games should send just the image file
const formData = new FormData();
formData.append('file', imageBlob);  // Just the image!

const response = await fetch('http://localhost:8001/predict/', {
  method: 'POST',
  body: formData
});
```

### ❌ **What Games Should NOT Send:**
- ❌ Manual landmark coordinates
- ❌ Pre-processed image tensors
- ❌ Feature vectors
- ❌ Multiple files

## 🔧 **Backend Processing (Automatic)**

When the backend receives your image, it automatically:

1. **Resizes** the image to 128×128 pixels
2. **Normalizes** pixel values for the model
3. **Extracts** 468 facial landmarks using MediaPipe
4. **Combines** image features + landmarks in the ViT model
5. **Returns** emotion prediction with confidence

## 🎮 **For Game Developers**

### **MissingLetterPop Example:**
The game already does this correctly:
```javascript
// In MissingLetterPop/index.jsx
const result = await emotionDetectionService.startEmotionDetection(
  handleEmotionDetected,
  showCameraPreview
);
```

The `emotionAPI.js` service handles:
- Camera access
- Image capture from webcam
- Sending to backend API
- Processing the response

## 📊 **API Response Format**

```javascript
// What your game receives back:
{
  "emotion": "happiness",           // Predicted emotion
  "confidence": 0.95,              // Confidence (0-1 scale)
  "probs": {                       // All emotion probabilities
    "anger": 0.05,
    "happiness": 0.95,
    "neutral": 0.00,
    "sadness": 0.00,
    "surprise": 0.00
  },
  "landmarks": [x1, y1, x2, y2, ...] // 936 values (optional)
}
```

## 🏗️ **Model Architecture (Technical Details)**

```
Input Image (Any Size) → Backend Processing → Emotion Output
        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend Processing                        │
│                                                             │
│  Image → Resize(128×128) → Normalize → ViT Encoder         │
│     ↓                                      ↓               │
│  MediaPipe → Extract 468 Landmarks → Landmark Vector       │
│                           ↓                                │
│              Fusion Layer (Image + Landmarks)              │
│                           ↓                                │
│                 5-Class Emotion Classifier                 │
│               (anger, happiness, neutral,                  │
│                sadness, surprise)                          │
└─────────────────────────────────────────────────────────────┘
```

## 📷 **Camera Requirements**

### **For Real-time Emotion Detection:**
- **Resolution**: Any common webcam resolution (API handles resizing)
- **Format**: JPG, PNG, or any common image format
- **Size**: No specific limit (API handles optimization)
- **Quality**: Standard webcam quality is sufficient

### **Recommended Settings:**
```javascript
// In your game's camera setup
const constraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: 'user'  // Front-facing camera
  }
};
```

## 🚀 **Performance Optimization**

### **Capture Frequency:**
```javascript
// MissingLetterPop captures every 5 seconds
emotionCaptureRef.current = setInterval(() => {
  emotionDetectionService.manualCapture();
}, 5000);  // 5 second intervals
```

### **Why This Frequency:**
- ⚡ **Performance**: Reduces API calls and processing load
- 🔋 **Battery**: Saves device battery life
- 📊 **Accuracy**: Emotions change slowly, 5s is sufficient
- 🎮 **Gaming**: Doesn't interrupt gameplay flow

## 🔍 **Testing Your Integration**

### **1. Test API Directly:**
Visit `http://localhost:8001/docs` and use the `/predict/` endpoint

### **2. Test in Your Game:**
```javascript
// Simple test function for your game
async function testEmotionAPI() {
  try {
    const result = await emotionDetectionService.startEmotionDetection(
      (emotion, confidence) => {
        console.log(`Detected: ${emotion} (${confidence})`);
      }
    );
    console.log('Camera active:', result);
  } catch (error) {
    console.error('Emotion detection failed:', error);
  }
}
```

### **3. Check Browser Console:**
Look for messages like:
```
🎯 Emotion detected (transformed): {emotion: "happiness", confidence: 0.95}
```

## 📝 **Summary for Game Integration**

1. **Use the existing `emotionAPI.js` service** - it handles everything
2. **Just call `startEmotionDetection()`** - pass your callback function
3. **Handle the emotion results** in your callback
4. **Don't worry about landmarks or preprocessing** - the backend does it all

**Your games are already correctly integrated!** The MissingLetterPop game is a perfect example of how it should work. 🎮✨
