// Simple test to create a child user and test game score saving
async function testWithNewUser() {
  const fetch = (await import('node-fetch')).default;
  
  try {
    console.log('🧪 Creating test child user...\n');
    
    // Register a new child user
    const registerResponse = await fetch('http://localhost:5000/api/register/child', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testchild@example.com',
        password: 'test123456',
        childName: 'Test Child',
        age: 8,
        parentEmail: 'parent@example.com'
      })
    });
    
    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      console.log('❌ Registration failed:', errorData);
      
      // Try to login with existing user instead
      console.log('\n🔄 Trying to login with existing user...');
      const loginResponse = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'testchild@example.com',
          password: 'test123456'
        })
      });
      
      if (!loginResponse.ok) {
        const loginError = await loginResponse.json();
        console.log('❌ Login also failed:', loginError);
        return;
      }
      
      var loginData = await loginResponse.json();
    } else {
      var loginData = await registerResponse.json();
      console.log('✅ User registered successfully');
    }
    
    console.log('🔑 Token obtained:', loginData.token ? 'Yes' : 'No');
    console.log('👤 User:', loginData.user);
    
    // Now test saving a game score
    console.log('\n🎮 Testing game score save...');
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
    
    console.log('📝 Game score data:', gameScoreData);
    
    const scoreResponse = await fetch('http://localhost:5000/api/game-scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(gameScoreData)
    });
    
    console.log('📡 Score save response status:', scoreResponse.status);
    
    if (!scoreResponse.ok) {
      const errorData = await scoreResponse.json();
      console.log('❌ Game score save failed:', errorData);
      return;
    }
    
    const scoreData = await scoreResponse.json();
    console.log('✅ Game score saved successfully!');
    console.log('💾 Saved score:', scoreData);
    
    // Test retrieving scores
    console.log('\n📊 Testing game score retrieval...');
    const getScoresResponse = await fetch('http://localhost:5000/api/game-scores', {
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
    console.log('✅ Scores retrieved successfully!');
    console.log('📈 Total scores found:', scoresData.scores.length);
    console.log('🏆 Scores:', scoresData.scores);
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testWithNewUser();
