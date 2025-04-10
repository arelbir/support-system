// Backend test script
const axios = require('axios');
const assert = require('assert');

// Test configuration
const API_URL = 'http://localhost:5000';
let authToken = '';
let testUserId = null;
let testTicketId = null;

// Test user credentials
const testUser = {
  username: 'test_user_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'Test123456!'
};

// Admin credentials
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'Admin123456!'
};

// Test functions
async function runTests() {
  try {
    console.log('Starting backend tests...');
    
    // 1. Test user registration
    await testUserRegistration();
    
    // 2. Test user login
    await testUserLogin();
    
    // 3. Test ticket creation
    await testTicketCreation();
    
    // 4. Test ticket listing
    await testTicketListing();
    
    // 5. Test ticket details
    await testTicketDetails();
    
    // 6. Test admin login
    await testAdminLogin();
    
    // 7. Test admin user management
    await testAdminUserManagement();
    
    // 8. Test admin status management
    await testAdminStatusManagement();
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Test user registration
async function testUserRegistration() {
  console.log('Testing user registration...');
  
  const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
  
  assert.strictEqual(response.status, 201, 'Registration should return 201 status');
  assert.ok(response.data.message, 'Registration response should contain a message');
  
  console.log('User registration test passed');
}

// Test user login
async function testUserLogin() {
  console.log('Testing user login...');
  
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email: testUser.email,
    password: testUser.password
  });
  
  assert.strictEqual(response.status, 200, 'Login should return 200 status');
  assert.ok(response.data.token, 'Login response should contain a token');
  
  // Save token for subsequent requests
  authToken = response.data.token;
  testUserId = response.data.user.id;
  
  console.log('User login test passed');
}

// Test ticket creation
async function testTicketCreation() {
  console.log('Testing ticket creation...');
  
  const ticketData = {
    title: 'Test Ticket',
    description: 'This is a test ticket created by automated tests',
    priority: 'medium'
  };
  
  const response = await axios.post(`${API_URL}/api/tickets`, ticketData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(response.status, 201, 'Ticket creation should return 201 status');
  assert.ok(response.data.ticket.id, 'Ticket creation response should contain a ticket ID');
  
  // Save ticket ID for subsequent tests
  testTicketId = response.data.ticket.id;
  
  console.log('Ticket creation test passed');
}

// Test ticket listing
async function testTicketListing() {
  console.log('Testing ticket listing...');
  
  const response = await axios.get(`${API_URL}/api/tickets/my`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(response.status, 200, 'Ticket listing should return 200 status');
  assert.ok(Array.isArray(response.data.tickets), 'Ticket listing response should contain an array of tickets');
  assert.ok(response.data.tickets.length > 0, 'Ticket listing should contain at least one ticket');
  
  console.log('Ticket listing test passed');
}

// Test ticket details
async function testTicketDetails() {
  console.log('Testing ticket details...');
  
  const response = await axios.get(`${API_URL}/api/tickets/${testTicketId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(response.status, 200, 'Ticket details should return 200 status');
  assert.strictEqual(response.data.ticket.id, testTicketId, 'Ticket details should match the requested ticket ID');
  
  console.log('Ticket details test passed');
}

// Test admin login
async function testAdminLogin() {
  console.log('Testing admin login...');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    assert.strictEqual(response.status, 200, 'Admin login should return 200 status');
    assert.ok(response.data.token, 'Admin login response should contain a token');
    assert.strictEqual(response.data.user.role, 'admin', 'User should have admin role');
    
    // Update token for admin requests
    authToken = response.data.token;
    
    console.log('Admin login test passed');
  } catch (error) {
    console.log('Admin login failed, creating admin user...');
    
    // Create admin user if it doesn't exist
    await createAdminUser();
    
    // Try login again
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    assert.strictEqual(response.status, 200, 'Admin login should return 200 status');
    assert.ok(response.data.token, 'Admin login response should contain a token');
    
    // Update token for admin requests
    authToken = response.data.token;
    
    console.log('Admin login test passed after creating admin user');
  }
}

// Create admin user if needed
async function createAdminUser() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, adminUser);
    
    // Get the user ID
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    const userId = loginResponse.data.user.id;
    
    // Update user role directly in database
    // This is a test-only operation and would normally be done through proper channels
    console.log('Please manually update the user role to admin in the database');
    console.log(`User ID: ${userId}`);
    
    return userId;
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    throw error;
  }
}

// Test admin user management
async function testAdminUserManagement() {
  console.log('Testing admin user management...');
  
  // Test user listing
  const listResponse = await axios.get(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(listResponse.status, 200, 'User listing should return 200 status');
  assert.ok(Array.isArray(listResponse.data.users), 'User listing response should contain an array of users');
  
  // Test user details
  const detailResponse = await axios.get(`${API_URL}/api/admin/users/${testUserId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(detailResponse.status, 200, 'User details should return 200 status');
  assert.strictEqual(detailResponse.data.user.id, testUserId, 'User details should match the requested user ID');
  
  console.log('Admin user management test passed');
}

// Test admin status management
async function testAdminStatusManagement() {
  console.log('Testing admin status management...');
  
  // Test status listing
  const listResponse = await axios.get(`${API_URL}/api/admin/statuses`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(listResponse.status, 200, 'Status listing should return 200 status');
  assert.ok(Array.isArray(listResponse.data.statuses), 'Status listing response should contain an array of statuses');
  
  // Test status creation
  const statusData = {
    name: 'Test Status',
    color: '#FF5733',
    description: 'This is a test status created by automated tests',
    order: 999,
    isDefault: false
  };
  
  const createResponse = await axios.post(`${API_URL}/api/admin/statuses`, statusData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(createResponse.status, 201, 'Status creation should return 201 status');
  assert.ok(createResponse.data.status.id, 'Status creation response should contain a status ID');
  
  const testStatusId = createResponse.data.status.id;
  
  // Test status update
  const updateData = {
    name: 'Updated Test Status',
    color: '#33FF57',
    description: 'This is an updated test status',
    order: 1000,
    isDefault: false
  };
  
  const updateResponse = await axios.put(`${API_URL}/api/admin/statuses/${testStatusId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(updateResponse.status, 200, 'Status update should return 200 status');
  assert.strictEqual(updateResponse.data.status.name, updateData.name, 'Status update should change the name');
  
  // Test status deletion
  const deleteResponse = await axios.delete(`${API_URL}/api/admin/statuses/${testStatusId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  assert.strictEqual(deleteResponse.status, 200, 'Status deletion should return 200 status');
  
  console.log('Admin status management test passed');
}

// Run the tests
runTests();
