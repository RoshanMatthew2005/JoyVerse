// Test script to check game score saving functionality

const API_BASE_URL = 'http://localhost:5000/api';

async function testGameScoreSaving() {
  const fetch = (await import('node-fetch')).default;
  
  try {
    console.log('🧪 Starting Game Score Test...\n');
    
    // First, let's try to login with a test user
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@child.com', // Assuming this is a test child user
        password: 'testpass'
      })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('User:', loginData.user);
    console.log('Token:', loginData.token ? 'Present' : 'Missing');
    
    // Now test saving a game score
    console.log('\n2. Testing game score save...');
    const gameScoreData = {
      gameType: 'kitten-match',
      score: 150,
      maxScore: 200,
      timeTaken: 45,
      level: 2,
      gameData: {
        matchesFound: 6,
        totalPairs: 8,
        difficulty: 'Ocean World'
      }
    };
    
    console.log('Game score data:', gameScoreData);
    
    const scoreResponse = await fetch(`${API_BASE_URL}/game-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(gameScoreData)
    });
    
    console.log('Score save response status:', scoreResponse.status);
    
    if (!scoreResponse.ok) {
      const errorData = await scoreResponse.json();
      console.log('❌ Game score save failed:', errorData);
      return;
    }
    
    const scoreData = await scoreResponse.json();
    console.log('✅ Game score saved successfully:', scoreData);
    
    // Test retrieving scores
    console.log('\n3. Testing game score retrieval...');
    const getScoresResponse = await fetch(`${API_BASE_URL}/game-scores`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!getScoresResponse.ok) {
      const errorData = await getScoresResponse.json();
      console.log('❌ Get scores failed:', errorData);
      return;
    }
    
    const scoresData = await getScoresResponse.json();
    console.log('✅ Scores retrieved successfully:');
    console.log('Total scores:', scoresData.scores.length);
    console.log('Scores:', scoresData.scores);
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testGameScoreSaving();
