const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joyverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    required: true,
    enum: ['therapist', 'child']
  },
  // Therapist specific fields
  fullName: {
    type: String,
    required: function() { return this.userType === 'therapist'; }
  },
  phoneNumber: {
    type: String,
    required: function() { return this.userType === 'therapist'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.userType === 'therapist'; }
  },
  // Child specific fields
  childName: {
    type: String,
    required: function() { return this.userType === 'child'; }
  },
  age: {
    type: Number,
    required: function() { return this.userType === 'child'; }
  },
  parentEmail: {
    type: String,
    required: function() { return this.userType === 'child'; }
  },  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Game Score Schema
const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['kitten-match', 'missing-letter-pop', 'art-studio']
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    default: null
  },
  timeTaken: {
    type: Number, // in seconds
    default: null
  },
  level: {
    type: Number,
    default: 1
  },
  gameData: {
    type: mongoose.Schema.Types.Mixed, // Store additional game-specific data
    default: {}
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
gameScoreSchema.index({ userId: 1, gameType: 1, playedAt: -1 });

const GameScore = mongoose.model('GameScore', gameScoreSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Joyverse API is running successfully!' });
});

// Database status check
app.get('/api/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const userCount = await User.countDocuments();
    const therapistCount = await User.countDocuments({ userType: 'therapist' });
    const childCount = await User.countDocuments({ userType: 'child' });
    
    res.json({
      database: {
        status: states[dbState],
        connection: process.env.MONGODB_URI || 'mongodb://localhost:27017/joyverse',
        name: 'joyverse'
      },
      statistics: {
        totalUsers: userCount,
        therapists: therapistCount,
        children: childCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      database: {
        status: 'error',
        error: error.message
      }
    });
  }
});

// Register User (Therapist)
app.post('/api/register/therapist', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 }),
  body('phoneNumber').trim().isLength({ min: 10 }),
  body('licenseNumber').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, phoneNumber, licenseNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new therapist user
    const newUser = new User({
      email,
      password: hashedPassword,
      userType: 'therapist',
      fullName,
      phoneNumber,
      licenseNumber
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Therapist registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
        fullName: newUser.fullName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register User (Child)
app.post('/api/register/child', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('childName').trim().isLength({ min: 2 }),
  body('age').isInt({ min: 3, max: 18 }),
  body('parentEmail').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, childName, age, parentEmail } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new child user
    const newUser = new User({
      email,
      password: hashedPassword,
      userType: 'child',
      childName,
      age,
      parentEmail
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, userType: newUser.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Child registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
        childName: newUser.childName,
        age: newUser.age
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login User
app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email and ensure account is active
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ 
        message: 'Access denied. Please check your credentials or register first.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Access denied. Please check your credentials or register first.' 
      });
    }

    // Update last login time
    await User.findByIdAndUpdate(user._id, { 
      lastLoginAt: new Date() 
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data based on user type
    let userData = {
      id: user._id,
      email: user.email,
      userType: user.userType
    };

    if (user.userType === 'therapist') {
      userData.fullName = user.fullName;
      userData.licenseNumber = user.licenseNumber;
    } else if (user.userType === 'child') {
      userData.childName = user.childName;
      userData.age = user.age;
    }

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User Profile (Protected Route)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify Token
app.post('/api/verify-token', authenticateToken, async (req, res) => {
  try {
    // Find user in database to ensure they still exist and are active
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account not found or inactive' });
    }

    // Prepare user data based on user type
    let userData = {
      id: user._id,
      email: user.email,
      userType: user.userType,
      registeredAt: user.registeredAt
    };

    if (user.userType === 'therapist') {
      userData.fullName = user.fullName;
      userData.licenseNumber = user.licenseNumber;
      userData.phoneNumber = user.phoneNumber;
    } else if (user.userType === 'child') {
      userData.childName = user.childName;
      userData.age = user.age;
      userData.parentEmail = user.parentEmail;
    }

    res.json({
      valid: true,
      user: userData
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if email is registered
app.post('/api/check-registration', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true }).select('email userType registeredAt');
    
    if (user) {
      res.json({
        isRegistered: true,
        userType: user.userType,
        registeredAt: user.registeredAt
      });
    } else {
      res.json({
        isRegistered: false,
        message: 'Email not found. Please register first to access the system.'
      });
    }
  } catch (error) {
    console.error('Registration check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get All Users (Admin/Therapist only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'therapist') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({ isActive: true }).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });  }
});

// ======================
// GAME SCORE ROUTES
// ======================

// Save Game Score
app.post('/api/game-scores', authenticateToken, [
  body('gameType').isIn(['kitten-match', 'missing-letter-pop', 'art-studio']),
  body('score').isNumeric().isInt({ min: 0 }),
  body('maxScore').optional().isNumeric(),
  body('timeTaken').optional().isNumeric(),
  body('level').optional().isInt({ min: 1 }),
  body('gameData').optional().isObject()
], async (req, res) => {
  try {
    console.log('🎮 BACKEND: Received game score save request');
    console.log('🎮 User ID:', req.user.userId);
    console.log('🎮 Request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { gameType, score, maxScore, timeTaken, level, gameData } = req.body;
    
    const gameScore = new GameScore({
      userId: req.user.userId,
      gameType,
      score,
      maxScore,
      timeTaken,
      level,
      gameData
    });

    console.log('💾 BACKEND: About to save game score:', gameScore);
    await gameScore.save();
    console.log('✅ BACKEND: Game score saved successfully with ID:', gameScore._id);

    res.status(201).json({
      message: 'Game score saved successfully',
      gameScore: {
        id: gameScore._id,
        gameType: gameScore.gameType,
        score: gameScore.score,
        maxScore: gameScore.maxScore,
        timeTaken: gameScore.timeTaken,
        level: gameScore.level,
        playedAt: gameScore.playedAt
      }
    });
  } catch (error) {
    console.error('💥 BACKEND: Save game score error:', error);
    res.status(500).json({ message: 'Failed to save game score' });
  }
});

// Get User's Game Scores
app.get('/api/game-scores', authenticateToken, async (req, res) => {
  try {
    const { gameType, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { userId: req.user.userId };
    if (gameType) {
      query.gameType = gameType;
    }

    const scores = await GameScore.find(query)
      .sort({ playedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('gameType score maxScore timeTaken level playedAt');

    const totalScores = await GameScore.countDocuments(query);

    res.json({
      scores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalScores / limit),
        totalScores,
        hasMore: skip + scores.length < totalScores
      }
    });
  } catch (error) {
    console.error('Get game scores error:', error);
    res.status(500).json({ message: 'Failed to fetch game scores' });
  }
});

// Get User's Best Scores by Game
app.get('/api/game-scores/best', authenticateToken, async (req, res) => {
  try {
    const bestScores = await GameScore.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: '$gameType',
          bestScore: { $max: '$score' },
          totalGames: { $sum: 1 },
          lastPlayed: { $max: '$playedAt' },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          gameType: '$_id',
          bestScore: 1,
          totalGames: 1,
          lastPlayed: 1,
          averageScore: { $round: ['$averageScore', 1] },
          _id: 0
        }
      }
    ]);

    res.json({ bestScores });
  } catch (error) {
    console.error('Get best scores error:', error);
    res.status(500).json({ message: 'Failed to fetch best scores' });
  }
});

// Get Game Statistics
app.get('/api/game-scores/stats', authenticateToken, async (req, res) => {
  try {
    const { gameType } = req.query;
    let matchQuery = { userId: new mongoose.Types.ObjectId(req.user.userId) };
    
    if (gameType) {
      matchQuery.gameType = gameType;
    }

    const stats = await GameScore.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTimePlayed: { $sum: '$timeTaken' },
          lastPlayed: { $max: '$playedAt' }
        }
      },
      {
        $project: {
          totalGames: 1,
          averageScore: { $round: ['$averageScore', 1] },
          bestScore: 1,
          totalTimePlayed: { $round: ['$totalTimePlayed', 0] },
          lastPlayed: 1,
          _id: 0
        }
      }
    ]);

    res.json({ 
      stats: stats.length > 0 ? stats[0] : {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimePlayed: 0,
        lastPlayed: null
      }
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ message: 'Failed to fetch game statistics' });
  }
});

// Delete Game Score (optional - for cleanup)
app.delete('/api/game-scores/:scoreId', authenticateToken, async (req, res) => {
  try {
    const { scoreId } = req.params;
    
    const gameScore = await GameScore.findOneAndDelete({
      _id: scoreId,
      userId: req.user.userId
    });

    if (!gameScore) {
      return res.status(404).json({ message: 'Game score not found' });
    }

    res.json({ message: 'Game score deleted successfully' });
  } catch (error) {
    console.error('Delete game score error:', error);
    res.status(500).json({ message: 'Failed to delete game score' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Joyverse API server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});
