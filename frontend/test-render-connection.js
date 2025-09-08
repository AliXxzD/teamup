// Test script to verify Render backend connection
const API_BASE_URL = 'https://teamup-oa5q.onrender.com';

async function testRenderConnection() {
  console.log('🔍 Testing Render backend connection...');
  console.log('📍 URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    console.log('   Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData);
    } else {
      console.log('   ❌ Health check failed');
    }
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    console.log('   Status:', rootResponse.status);
    
    if (rootResponse.ok) {
      const rootData = await rootResponse.text();
      console.log('   ✅ Root endpoint response:', rootData.substring(0, 100));
    } else {
      console.log('   ❌ Root endpoint failed');
    }
    
    // Test events endpoint (should require auth)
    console.log('\n3. Testing events endpoint (should require auth)...');
    const eventsResponse = await fetch(`${API_BASE_URL}/api/events`);
    console.log('   Status:', eventsResponse.status);
    
    if (eventsResponse.status === 401) {
      console.log('   ✅ Events endpoint correctly requires authentication');
    } else {
      console.log('   ⚠️  Unexpected response from events endpoint');
    }
    
    console.log('\n🎉 Render backend connection test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Render connection:', error.message);
  }
}

// Run the test
testRenderConnection();
