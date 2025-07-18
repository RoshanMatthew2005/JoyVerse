# 🌟 JoyVerse - Therapeutic Gaming Platform

<div align="center">

![JoyVerse Logo](https://img.shields.io/badge/JoyVerse-Therapeutic%20Gaming-brightgreen?style=for-the-badge&logo=gamepad&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://mongodb.com/)

**A revolutionary platform combining therapeutic intervention with engaging gaming experiences**

[🎮 Demo](#demo) • [📚 Documentation](#documentation) • [🚀 Quick Start](#quick-start) • [🤝 Contributing](#contributing)

</div>

---

## 📖 Overview

**JoyVerse** is an innovative therapeutic gaming platform designed to support mental health through interactive games and real-time emotion detection. The platform serves children, therapists, and administrators with tailored dashboards and comprehensive analytics.

### 🎯 Mission
To make mental health therapy engaging, accessible, and effective through gamification and cutting-edge emotion recognition technology.

---

## ✨ Key Features

### 🎮 **Interactive Games**
- **🟡 PacMan Quest** - Classic arcade with therapeutic twists
- **🔤 Missing Letter Pop** - Educational bubble-popping game  
- **🚀 Space Math** - Mathematical adventure in space
- **🎨 Art Studio** - Creative expression through digital art
- **🎵 Music Fun** - Musical therapy and sound exploration
- **🐱 Kitten Match** - Memory and pattern recognition

### 🧠 **AI-Powered Emotion Detection**
- Real-time facial emotion recognition using Vision Transformer (ViT)
- 5-class emotion classification: Anger, Happiness, Neutral, Sadness, Surprise
- MongoDB integration for emotion tracking and analytics
- MediaPipe face mesh for precise landmark detection

### 👥 **Multi-User Support**
- **Children**: Personalized gaming experience with progress tracking
- **Therapists**: Comprehensive dashboards with client analytics
- **Super Admins**: System-wide management and oversight

### 📊 **Analytics & Insights**
- Real-time emotion trend analysis
- Gaming performance metrics
- Therapeutic progress tracking
- Visual charts and reports using Recharts

---

## 🏗️ Architecture

```
JoyVerse/
├── 🌐 FrontEnd/          # React.js Client Application
├── ⚡ MiddleWare(B)/      # Node.js Express API Server  
└── 🤖 Model/             # Python FastAPI ML Service
```

### 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18, Vite, TailwindCSS | User interface and gaming experience |
| **Backend** | Node.js, Express.js, MongoDB | API services and data management |
| **ML Service** | Python, FastAPI, PyTorch | Emotion detection and analysis |
| **Database** | MongoDB Atlas | Data persistence and analytics |
| **Authentication** | JWT | Secure user authentication |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm 8+
- **Python** 3.8+
- **MongoDB** (Atlas or local instance)
- **Git**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/RoshanMatthew2005/JoyVerse.git
cd JoyVerse
```

### 2️⃣ Setup Frontend
```bash
cd FrontEnd
npm install
npm run dev
```
🌐 **Frontend runs on:** `http://localhost:5173`

### 3️⃣ Setup Backend API
```bash
cd MiddleWare(B)
npm install

# Configure environment variables
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "JWT_SECRET=your_jwt_secret_key" >> .env

npm run dev
```
⚡ **API runs on:** `http://localhost:3000`

### 4️⃣ Setup ML Service
```bash
cd Model
pip install -r requirements.txt
python main.py
```
🤖 **ML Service runs on:** `http://localhost:8001`

---

## 📁 Project Structure

<details>
<summary>Click to expand detailed structure</summary>

```
JoyVerse/
├── 📱 FrontEnd/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── GameLayout.jsx
│   │   │   ├── GameStats.jsx
│   │   │   └── games/           # Individual game components
│   │   ├── pages/               # Application pages
│   │   │   ├── ChildDashboard.jsx
│   │   │   ├── TherapistDashboard.jsx
│   │   │   └── game pages...
│   │   ├── services/            # API integration
│   │   ├── context/             # React context providers
│   │   └── utils/               # Helper functions
│   ├── public/
│   └── package.json
│
├── ⚙️ MiddleWare(B)/
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Database schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Custom middleware
│   │   └── config/              # Configuration files
│   └── server.js
│
└── 🧠 Model/
    ├── models/                  # Trained ML models
    ├── Transformer/             # Model training notebooks
    ├── vit_model.py            # Vision Transformer implementation
    └── main.py                 # FastAPI application
```
</details>

---

## 🎮 Game Features

### Educational Games
- **Learning-focused**: Each game targets specific cognitive skills
- **Progress Tracking**: Detailed analytics on improvement
- **Adaptive Difficulty**: Games adjust to player skill level

### Therapeutic Integration
- **Emotion Monitoring**: Real-time emotion detection during gameplay
- **Stress Indicators**: Identification of challenging moments
- **Positive Reinforcement**: Encouraging feedback and rewards

---

## 👨‍⚕️ Therapist Dashboard

### Patient Management
- Client progress overview
- Emotion trend analysis  
- Gaming performance metrics
- Session notes and observations

### Analytics Features
- Visual emotion charts
- Gameplay pattern analysis
- Progress reports generation
- Custom therapeutic notes

---

## 🔧 API Endpoints

<details>
<summary>Main API Routes</summary>

### Authentication
```
POST /api/auth/register/child     # Child registration
POST /api/auth/register/therapist # Therapist registration  
POST /api/auth/login             # User login
POST /api/auth/verify-token      # Token verification
```

### User Management
```
GET  /api/users/profile          # Get user profile
POST /api/users/check-registration # Check email registration
GET  /api/users/all             # Get all users (admin)
```

### Game Scores
```
POST /api/game-scores           # Submit game score
GET  /api/game-scores/user/:id  # Get user's scores
GET  /api/game-scores/stats     # Get score statistics
```

### Emotions
```
POST /api/emotions              # Submit emotion data
GET  /api/emotions/user/:id     # Get user emotions
GET  /api/emotions/trends       # Get emotion trends
```
</details>

---

## 🤖 Machine Learning

### Emotion Detection Model
- **Architecture**: Vision Transformer (ViT) 
- **Classes**: 5 emotions (anger, happiness, neutral, sadness, surprise)
- **Input**: 128x128 RGB facial images
- **Performance**: High accuracy on emotion classification

### Features
- Real-time face detection using MediaPipe
- Robust preprocessing pipeline
- MongoDB integration for data storage
- RESTful API for easy integration

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for users/therapists/admins
- **Data Encryption**: Secure data transmission and storage
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse prevention

---

## 📊 Monitoring & Health Checks

### Backend Health Check
```bash
curl http://localhost:3000/health
```

### ML Service Health Check  
```bash
curl http://localhost:8001/health
```

### Database Status
```bash
curl http://localhost:3000/api/users/db-status
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd FrontEnd
npm run test
```

### Backend Tests
```bash
cd MiddleWare(B)
npm run test
npm run test:coverage
```

### ML Service Tests
```bash
cd Model
python -m pytest tests/
```

---

## 🌍 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_ML_API_URL=http://localhost:8001
```

---

## 📈 Performance Metrics

- **Frontend**: Built with Vite for fast development and production builds
- **Backend**: Express.js with MongoDB for scalable data operations  
- **ML Service**: FastAPI for high-performance ML inference
- **Real-time Features**: WebSocket support for live emotion tracking

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow ESLint configurations for JavaScript/React
- Use PEP 8 for Python code
- Write tests for new features
- Update documentation as needed

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

### Development Team
- **Frontend Development**: React.js specialists
- **Backend Development**: Node.js experts
- **ML Engineering**: Python/PyTorch developers
- **UI/UX Design**: User experience designers

---

## 📞 Support

### Getting Help
- 📧 **Email**: support@joyverse.com
- 💬 **Issues**: [GitHub Issues](https://github.com/RoshanMatthew2005/JoyVerse/issues)
- 📖 **Documentation**: [Wiki](https://github.com/RoshanMatthew2005/JoyVerse/wiki)

### FAQ
**Q: How do I reset my password?**
A: Use the password reset feature on the login page.

**Q: Can I run this on my local machine?**
A: Yes! Follow the Quick Start guide above.

**Q: How accurate is the emotion detection?**
A: Our ViT model achieves high accuracy on standard emotion datasets.

---

## 🚀 Roadmap

### Version 2.0 (Upcoming)
- [ ] Voice emotion recognition
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with wearable devices

### Long-term Goals
- [ ] VR/AR therapy experiences
- [ ] AI-powered therapy recommendations
- [ ] Blockchain-based progress verification
- [ ] Global therapist network

---

## 🌟 Acknowledgments

- **MongoDB Atlas** for cloud database services
- **OpenAI** for inspiration in AI integration
- **React Community** for excellent documentation
- **PyTorch Team** for machine learning framework
- **All Contributors** who make this project possible

---

<div align="center">

**Made with ❤️ by the JoyVerse Team**

⭐ **Star this repo if you find it helpful!** ⭐

[🔝 Back to Top](#-joyverse---therapeutic-gaming-platform)

</div>
