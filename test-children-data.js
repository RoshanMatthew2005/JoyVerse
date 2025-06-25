// Test script to check children data API for therapists
async function testChildrenDataAPI() {
  const fetch = (await import('node-fetch')).default;
  
  try {
    console.log('🩺 Testing Children Data API...\n');
    
    // First, create/login as a therapist
    console.log('1. Creating/logging in as therapist...');
    const therapistLogin = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'therapist@example.com',
        password: 'therapist123'
      })
    });
    
    let therapistData;
    if (!therapistLogin.ok) {
      // Try to register therapist
      console.log('Creating new therapist account...');
      const registerResponse = await fetch('http://localhost:5000/api/register/therapist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },        body: JSON.stringify({
          email: 'therapist@example.com',
          password: 'therapist123',
          fullName: 'Dr. Jane Smith',
          phoneNumber: '5551234567890', // Longer phone number
          licenseNumber: 'LIC123456'
        })
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        console.error('❌ Failed to create therapist:', error);
        return;
      }
      
      therapistData = await registerResponse.json();
    } else {
      therapistData = await therapistLogin.json();
    }
    
    console.log('✅ Therapist authenticated:', therapistData.user.fullName);
    
    // Now test the children data API
    console.log('\n2. Fetching children data...');
    const childrenResponse = await fetch('http://localhost:5000/api/therapist/children', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${therapistData.token}`
      }
    });
    
    console.log('📡 Children API response status:', childrenResponse.status);
    
    if (!childrenResponse.ok) {
      const errorData = await childrenResponse.json();
      console.log('❌ Children data fetch failed:', errorData);
      return;
    }
    
    const childrenData = await childrenResponse.json();
    console.log('✅ Children data retrieved successfully!');
    console.log('📊 Summary:', childrenData.summary);
    console.log(`👶 Found ${childrenData.children.length} children:`);
    
    childrenData.children.forEach((child, index) => {
      console.log(`\n${index + 1}. ${child.name} (Age: ${child.age})`);
      console.log(`   Email: ${child.email}`);
      console.log(`   Total Games Played: ${child.totalGamesPlayed}`);
      console.log(`   Overall Progress: ${child.overallProgress}%`);
      console.log(`   Strengths: ${child.strengths.join(', ')}`);
      console.log(`   Challenges: ${child.challenges.join(', ')}`);
      
      Object.entries(child.games).forEach(([gameType, stats]) => {
        console.log(`   ${gameType}: Score ${stats.score}, Played ${stats.totalPlayed} times`);
      });
    });
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testChildrenDataAPI();
