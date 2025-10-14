const axios = require('axios');

// This is a sample test file. You will need to have a running instance of the backend
// and a user with a keyword in the database for this test to pass.

// You will also need to set the JWT token for the authenticated user.
const JWT_TOKEN = 'your_jwt_token';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': JWT_TOKEN,
  },
});

async function testGetKeywords() {
  try {
    const res = await api.get('/keywords');
    console.log('GET /keywords response:', res.data);
  } catch (error) {
    console.error('Error getting keywords:', error.response.data);
  }
}

async function testAddKeyword() {
  try {
    const res = await api.post('/keywords', { keyword: 'test' });
    console.log('POST /keywords response:', res.data);
  } catch (error) {
    console.error('Error adding keyword:', error.response.data);
  }
}

async function runTests() {
  await testGetKeywords();
  await testAddKeyword();
}

runTests();
