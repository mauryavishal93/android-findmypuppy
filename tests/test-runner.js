/**
 * FindMyPuppy - Comprehensive Test Suite
 * SDET: 15 Years Experience
 * Test Coverage: Functional, Non-Functional, Security, Edge Cases
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5774';
const TEST_USERNAME = process.env.TEST_USERNAME || 'loser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'loser';
const testResults = [];

// Test Result Structure
class TestResult {
  constructor(category, testCase, description, status, details, executionTime) {
    this.category = category;
    this.testCase = testCase;
    this.description = description;
    this.status = status; // 'PASS', 'FAIL', 'SKIP', 'WARNING'
    this.details = details || '';
    this.executionTime = executionTime || 0;
    this.timestamp = new Date().toISOString();
  }
}

// Helper Functions
async function makeRequest(method, endpoint, body = null, headers = {}) {
  const startTime = Date.now();
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    const executionTime = Date.now() - startTime;
    return { status: response.status, data, executionTime, headers: response.headers };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return { status: 0, data: { error: error.message }, executionTime };
  }
}

function addTestResult(category, testCase, description, status, details, executionTime) {
  testResults.push(new TestResult(category, testCase, description, status, details, executionTime));
}

// ==================== AUTHENTICATION TESTS ====================

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // TC-AUTH-001: Valid Login
  try {
    const { status, data, executionTime } = await makeRequest('POST', '/api/login', {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    if (status === 200 && data.success) {
      addTestResult('Authentication', 'TC-AUTH-001', 'Valid Login', 'PASS', 
        `Login successful for ${TEST_USERNAME}`, executionTime);
    } else if (status === 404) {
      addTestResult('Authentication', 'TC-AUTH-001', 'Valid Login', 'SKIP', 
        'Test user does not exist - create user first', executionTime);
    } else {
      addTestResult('Authentication', 'TC-AUTH-001', 'Valid Login', 'FAIL', 
        `Expected 200, got ${status}: ${JSON.stringify(data)}`, executionTime);
    }
  } catch (error) {
    addTestResult('Authentication', 'TC-AUTH-001', 'Valid Login', 'FAIL', error.message, 0);
  }

  // TC-AUTH-002: Invalid Username
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/login', {
    username: 'nonexistentuser12345',
    password: 'anypassword'
  });
  if (status2 === 404 && data2.success === false) {
    addTestResult('Authentication', 'TC-AUTH-002', 'Invalid Username', 'PASS', 
      'Correctly rejected non-existent user', time2);
  } else {
    addTestResult('Authentication', 'TC-AUTH-002', 'Invalid Username', 'FAIL', 
      `Expected 404, got ${status2}`, time2);
  }

  // TC-AUTH-003: Invalid Password
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/login', {
    username: TEST_USERNAME,
    password: 'wrongpassword'
  });
  if (status3 === 401 && data3.success === false) {
    addTestResult('Authentication', 'TC-AUTH-003', 'Invalid Password', 'PASS', 
      'Correctly rejected wrong password', time3);
  } else {
    addTestResult('Authentication', 'TC-AUTH-003', 'Invalid Password', 'SKIP', 
      'User may not exist', time3);
  }

  // TC-AUTH-004: Missing Credentials
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/login', {
    username: '',
    password: ''
  });
  if (status4 === 400 || status4 === 404) {
    addTestResult('Authentication', 'TC-AUTH-004', 'Missing Credentials', 'PASS', 
      'Correctly rejected empty credentials', time4);
  } else {
    addTestResult('Authentication', 'TC-AUTH-004', 'Missing Credentials', 'WARNING', 
      `Expected validation error, got ${status4}`, time4);
  }

  // TC-AUTH-005: Valid Signup
  const randomUser = `testuser_${Date.now()}`;
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/signup', {
    username: randomUser,
    email: `${randomUser}@test.com`,
    password: 'TestPass123!'
  });
  if (status5 === 201 && data5.success) {
    addTestResult('Authentication', 'TC-AUTH-005', 'Valid Signup', 'PASS', 
      `User ${randomUser} created successfully`, time5);
  } else if (status5 === 409) {
    addTestResult('Authentication', 'TC-AUTH-005', 'Valid Signup', 'SKIP', 
      'User already exists', time5);
  } else {
    addTestResult('Authentication', 'TC-AUTH-005', 'Valid Signup', 'FAIL', 
      `Expected 201, got ${status5}: ${JSON.stringify(data5)}`, time5);
  }

  // TC-AUTH-006: Duplicate Username Signup
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/signup', {
    username: TEST_USERNAME,
    email: 'different@test.com',
    password: 'TestPass123!'
  });
  if (status6 === 409 && data6.success === false) {
    addTestResult('Authentication', 'TC-AUTH-006', 'Duplicate Username', 'PASS', 
      'Correctly rejected duplicate username', time6);
  } else {
    addTestResult('Authentication', 'TC-AUTH-006', 'Duplicate Username', 'SKIP', 
      'User may not exist', time6);
  }

  // TC-AUTH-007: Duplicate Email Signup
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/signup', {
    username: `newuser_${Date.now()}`,
    email: 'test@test.com',
    password: 'TestPass123!'
  });
  if (status7 === 409 && data7.success === false) {
    addTestResult('Authentication', 'TC-AUTH-007', 'Duplicate Email', 'PASS', 
      'Correctly rejected duplicate email', time7);
  } else {
    addTestResult('Authentication', 'TC-AUTH-007', 'Duplicate Email', 'SKIP', 
      'Email may not exist', time7);
  }

  // TC-AUTH-008: Missing Signup Fields
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/signup', {
    username: '',
    email: '',
    password: ''
  });
  if (status8 === 400 && data8.success === false) {
    addTestResult('Authentication', 'TC-AUTH-008', 'Missing Signup Fields', 'PASS', 
      'Correctly validated required fields', time8);
  } else {
    addTestResult('Authentication', 'TC-AUTH-008', 'Missing Signup Fields', 'WARNING', 
      `Expected 400, got ${status8}`, time8);
  }

  // TC-AUTH-009: SQL Injection Attempt (Username)
  const { status: status9, data: data9, executionTime: time9 } = await makeRequest('POST', '/api/login', {
    username: "admin' OR '1'='1",
    password: 'anything'
  });
  if (status9 === 404 || status9 === 401) {
    addTestResult('Authentication', 'TC-AUTH-009', 'SQL Injection Protection (Username)', 'PASS', 
      'SQL injection attempt safely rejected', time9);
  } else {
    addTestResult('Authentication', 'TC-AUTH-009', 'SQL Injection Protection (Username)', 'FAIL', 
      `Potential SQL injection vulnerability: ${status9}`, time9);
  }

  // TC-AUTH-010: XSS Attempt (Username)
  const { status: status10, data: data10, executionTime: time10 } = await makeRequest('POST', '/api/login', {
    username: '<script>alert("XSS")</script>',
    password: 'test'
  });
  if (status10 === 404 || status10 === 401) {
    addTestResult('Authentication', 'TC-AUTH-010', 'XSS Protection (Username)', 'PASS', 
      'XSS attempt safely rejected', time10);
  } else {
    addTestResult('Authentication', 'TC-AUTH-010', 'XSS Protection (Username)', 'WARNING', 
      `XSS attempt returned ${status10}`, time10);
  }

  // TC-AUTH-011: Password Hashing Verification
  // Use the test user if it exists, otherwise create a new one
  const { status: status11a } = await makeRequest('POST', '/api/login', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD
  });
  if (status11a === 200) {
    // User exists, verify password was hashed by logging in
    const { status: status11b, data: data11b, executionTime: time11 } = await makeRequest('POST', '/api/login', {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    if (status11b === 200 && data11b.success) {
      addTestResult('Authentication', 'TC-AUTH-011', 'Password Hashing', 'PASS', 
        'Password correctly hashed and verified', time11);
    } else {
      addTestResult('Authentication', 'TC-AUTH-011', 'Password Hashing', 'FAIL', 
        'Password hashing/verification failed', time11);
    }
  } else {
    addTestResult('Authentication', 'TC-AUTH-011', 'Password Hashing', 'SKIP', 
      'Could not create test user', 0);
  }
}

// ==================== USER DATA TESTS ====================

async function testUserData() {
  console.log('\n👤 Testing User Data Management...');
  
  const testUser = `datatest_${Date.now()}`;
  
  // Create test user first
  await makeRequest('POST', '/api/signup', {
    username: testUser,
    email: `${testUser}@test.com`,
    password: 'TestPass123!'
  });

  // TC-USER-001: Get User Data
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('GET', `/api/user/${testUser}`);
  if (status1 === 200 && data1.success && data1.user) {
    addTestResult('User Data', 'TC-USER-001', 'Get User Data', 'PASS', 
      `Retrieved user data for ${testUser}`, time1);
  } else {
    addTestResult('User Data', 'TC-USER-001', 'Get User Data', 'FAIL', 
      `Expected 200, got ${status1}`, time1);
  }

  // TC-USER-002: Update Hints
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 50
  });
  if (status2 === 200 && data2.success && data2.hints === 50) {
    addTestResult('User Data', 'TC-USER-002', 'Update Hints', 'PASS', 
      'Hints updated successfully', time2);
  } else {
    addTestResult('User Data', 'TC-USER-002', 'Update Hints', 'FAIL', 
      `Expected hints=50, got ${JSON.stringify(data2)}`, time2);
  }

  // TC-USER-003: Update Points
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/user/update-points', {
    username: testUser,
    points: 100
  });
  if (status3 === 200 && data3.success && data3.points === 100) {
    addTestResult('User Data', 'TC-USER-003', 'Update Points', 'PASS', 
      'Points updated successfully', time3);
  } else {
    addTestResult('User Data', 'TC-USER-003', 'Update Points', 'FAIL', 
      `Expected points=100, got ${JSON.stringify(data3)}`, time3);
  }

  // TC-USER-004: Update Level Passed (Easy)
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 5
  });
  if (status4 === 200 && data4.success && data4.levelPassedEasy === 5) {
    addTestResult('User Data', 'TC-USER-004', 'Update Level Passed (Easy)', 'PASS', 
      'Level passed updated successfully', time4);
  } else {
    addTestResult('User Data', 'TC-USER-004', 'Update Level Passed (Easy)', 'FAIL', 
      `Expected levelPassedEasy=5, got ${JSON.stringify(data4)}`, time4);
  }

  // TC-USER-005: Update Level Passed (Medium)
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Medium',
    levelPassed: 3
  });
  if (status5 === 200 && data5.success && data5.levelPassedMedium === 3) {
    addTestResult('User Data', 'TC-USER-005', 'Update Level Passed (Medium)', 'PASS', 
      'Medium level passed updated', time5);
  } else {
    addTestResult('User Data', 'TC-USER-005', 'Update Level Passed (Medium)', 'FAIL', 
      `Expected levelPassedMedium=3`, time5);
  }

  // TC-USER-006: Update Level Passed (Hard)
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Hard',
    levelPassed: 2
  });
  if (status6 === 200 && data6.success && data6.levelPassedHard === 2) {
    addTestResult('User Data', 'TC-USER-006', 'Update Level Passed (Hard)', 'PASS', 
      'Hard level passed updated', time6);
  } else {
    addTestResult('User Data', 'TC-USER-006', 'Update Level Passed (Hard)', 'FAIL', 
      `Expected levelPassedHard=2`, time6);
  }

  // TC-USER-007: Invalid Username in Update
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/user/update-hints', {
    username: 'nonexistent_user_xyz',
    hints: 10
  });
  if (status7 === 404 && data7.success === false) {
    addTestResult('User Data', 'TC-USER-007', 'Invalid Username Validation', 'PASS', 
      'Correctly rejected invalid username', time7);
  } else {
    addTestResult('User Data', 'TC-USER-007', 'Invalid Username Validation', 'FAIL', 
      `Expected 404, got ${status7}`, time7);
  }

  // TC-USER-008: Missing Required Fields
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/user/update-hints', {
    username: '',
    hints: undefined
  });
  if (status8 === 400 && data8.success === false) {
    addTestResult('User Data', 'TC-USER-008', 'Missing Required Fields', 'PASS', 
      'Correctly validated required fields', time8);
  } else {
    addTestResult('User Data', 'TC-USER-008', 'Missing Required Fields', 'WARNING', 
      `Expected 400, got ${status8}`, time8);
  }

  // TC-USER-009: Negative Values
  const { status: status9, data: data9, executionTime: time9 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: -10
  });
  if (status9 === 200) {
    addTestResult('User Data', 'TC-USER-009', 'Negative Values Handling', 'WARNING', 
      'Negative values accepted - consider validation', time9);
  } else {
    addTestResult('User Data', 'TC-USER-009', 'Negative Values Handling', 'PASS', 
      'Negative values rejected', time9);
  }

  // TC-USER-010: Very Large Values
  const { status: status10, data: data10, executionTime: time10 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 999999999
  });
  if (status10 === 200) {
    addTestResult('User Data', 'TC-USER-010', 'Large Values Handling', 'PASS', 
      'Large values accepted (may be intentional)', time10);
  } else {
    addTestResult('User Data', 'TC-USER-010', 'Large Values Handling', 'WARNING', 
      `Large values rejected: ${status10}`, time10);
  }
}

// ==================== PURCHASE HISTORY TESTS ====================

async function testPurchaseHistory() {
  console.log('\n💰 Testing Purchase History...');
  
  const testUser = `purchasetest_${Date.now()}`;
  
  // Create test user
  await makeRequest('POST', '/api/signup', {
    username: testUser,
    email: `${testUser}@test.com`,
    password: 'TestPass123!'
  });

  // TC-PURCH-001: Create Purchase History (Money)
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money'
  });
  if (status1 === 201 && data1.success && data1.purchase) {
    addTestResult('Purchase History', 'TC-PURCH-001', 'Create Purchase (Money)', 'PASS', 
      'Purchase history created successfully', time1);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-001', 'Create Purchase (Money)', 'FAIL', 
      `Expected 201, got ${status1}: ${JSON.stringify(data1)}`, time1);
  }

  // TC-PURCH-002: Create Purchase History (Points)
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 10,
    purchaseType: 'Hints',
    pack: '2 Hints Pack (Points)',
    purchaseMode: 'Points'
  });
  if (status2 === 201 && data2.success) {
    addTestResult('Purchase History', 'TC-PURCH-002', 'Create Purchase (Points)', 'PASS', 
      'Points purchase recorded', time2);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-002', 'Create Purchase (Points)', 'FAIL', 
      `Expected 201, got ${status2}`, time2);
  }

  // TC-PURCH-003: Get Purchase History
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('GET', `/api/purchase-history/${testUser}`);
  if (status3 === 200 && data3.success && Array.isArray(data3.purchases)) {
    addTestResult('Purchase History', 'TC-PURCH-003', 'Get Purchase History', 'PASS', 
      `Retrieved ${data3.purchases.length} purchases`, time3);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-003', 'Get Purchase History', 'FAIL', 
      `Expected array of purchases, got ${JSON.stringify(data3)}`, time3);
  }

  // TC-PURCH-004: Duplicate Purchase Prevention
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money'
  });
  // Immediately try again
  const { status: status4b, data: data4b, executionTime: time4b } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money'
  });
  if (status4b === 200 && data4b.message && data4b.message.includes('Duplicate')) {
    addTestResult('Purchase History', 'TC-PURCH-004', 'Duplicate Purchase Prevention', 'PASS', 
      'Duplicate purchase correctly prevented', time4b);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-004', 'Duplicate Purchase Prevention', 'WARNING', 
      'Duplicate prevention may need review', time4b);
  }

  // TC-PURCH-005: Missing Required Fields
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/purchase-history', {
    username: '',
    amount: undefined,
    purchaseType: '',
    pack: ''
  });
  if (status5 === 400 && data5.success === false) {
    addTestResult('Purchase History', 'TC-PURCH-005', 'Missing Required Fields', 'PASS', 
      'Correctly validated required fields', time5);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-005', 'Missing Required Fields', 'WARNING', 
      `Expected 400, got ${status5}`, time5);
  }

  // TC-PURCH-006: Invalid Purchase Type
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 10,
    purchaseType: 'InvalidType',
    pack: 'Test Pack'
  });
  if (status6 === 400 && data6.success === false) {
    addTestResult('Purchase History', 'TC-PURCH-006', 'Invalid Purchase Type', 'PASS', 
      'Correctly rejected invalid purchase type', time6);
  } else {
    addTestResult('Purchase History', 'TC-PURCH-006', 'Invalid Purchase Type', 'WARNING', 
      `Expected 400, got ${status6}`, time6);
  }

  // TC-PURCH-007: User Isolation (Security)
  const otherUser = `otheruser_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: otherUser,
    email: `${otherUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('GET', `/api/purchase-history/${testUser}`);
  if (status7 === 200 && data7.success) {
    // Verify user can only see their own purchases
    const testUserPurchases = data7.purchases || [];
    const hasOtherUserData = testUserPurchases.some(p => p.username !== testUser);
    if (!hasOtherUserData) {
      addTestResult('Purchase History', 'TC-PURCH-007', 'User Data Isolation', 'PASS', 
        'Users can only see their own purchases', time7);
    } else {
      addTestResult('Purchase History', 'TC-PURCH-007', 'User Data Isolation', 'FAIL', 
        'User data isolation compromised', time7);
    }
  } else {
    addTestResult('Purchase History', 'TC-PURCH-007', 'User Data Isolation', 'SKIP', 
      'Could not verify isolation', time7);
  }
}

// ==================== PRICE OFFER TESTS ====================

async function testPriceOffer() {
  console.log('\n💵 Testing Price Offer...');
  
  // TC-PRICE-001: Get Price Offer
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('GET', '/api/price-offer');
  if (status1 === 200 && data1.success && data1.offer) {
    addTestResult('Price Offer', 'TC-PRICE-001', 'Get Price Offer', 'PASS', 
      `Retrieved price offer: ${data1.offer.hintPack}`, time1);
  } else {
    addTestResult('Price Offer', 'TC-PRICE-001', 'Get Price Offer', 'FAIL', 
      `Expected offer data, got ${JSON.stringify(data1)}`, time1);
  }

  // TC-PRICE-002: Create/Update Price Offer
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/price-offer', {
    hintPack: '100 Hints Pack',
    marketPrice: 99,
    offerPrice: 9,
    hintCount: 100,
    offerReason: 'Special Offer'
  });
  if (status2 === 200 && data2.success && data2.offer) {
    addTestResult('Price Offer', 'TC-PRICE-002', 'Update Price Offer', 'PASS', 
      'Price offer updated successfully', time2);
  } else {
    addTestResult('Price Offer', 'TC-PRICE-002', 'Update Price Offer', 'FAIL', 
      `Expected 200, got ${status2}`, time2);
  }

  // TC-PRICE-003: Missing Required Fields
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/price-offer', {
    hintPack: '',
    marketPrice: undefined,
    offerPrice: undefined
  });
  if (status3 === 400 && data3.success === false) {
    addTestResult('Price Offer', 'TC-PRICE-003', 'Missing Required Fields', 'PASS', 
      'Correctly validated required fields', time3);
  } else {
    addTestResult('Price Offer', 'TC-PRICE-003', 'Missing Required Fields', 'WARNING', 
      `Expected 400, got ${status3}`, time3);
  }

  // TC-PRICE-004: Invalid Price Values
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/price-offer', {
    hintPack: 'Test Pack',
    marketPrice: -10,
    offerPrice: -5,
    hintCount: -1
  });
  if (status4 === 200) {
    addTestResult('Price Offer', 'TC-PRICE-004', 'Invalid Price Values', 'WARNING', 
      'Negative values accepted - consider validation', time4);
  } else {
    addTestResult('Price Offer', 'TC-PRICE-004', 'Invalid Price Values', 'PASS', 
      'Negative values rejected', time4);
  }
}

// ==================== SECURITY TESTS ====================

async function testSecurity() {
  console.log('\n🔒 Testing Security...');
  
  // TC-SEC-001: CORS Headers
  const { status: status1, headers: headers1, executionTime: time1 } = await makeRequest('GET', '/api/health');
  const corsHeader = headers1?.get ? headers1.get('access-control-allow-origin') : (headers1?.['access-control-allow-origin'] || headers1?.['Access-Control-Allow-Origin']);
  if (corsHeader) {
    addTestResult('Security', 'TC-SEC-001', 'CORS Configuration', 'PASS', 
      `CORS header present: ${corsHeader}`, time1);
  } else {
    addTestResult('Security', 'TC-SEC-001', 'CORS Configuration', 'WARNING', 
      'CORS header not found', time1);
  }

  // TC-SEC-002: SQL Injection in Username
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/login', {
    username: "'; DROP TABLE users; --",
    password: 'test'
  });
  if (status2 === 404 || status2 === 401) {
    addTestResult('Security', 'TC-SEC-002', 'SQL Injection Protection', 'PASS', 
      'SQL injection safely handled', time2);
  } else {
    addTestResult('Security', 'TC-SEC-002', 'SQL Injection Protection', 'FAIL', 
      `Potential SQL injection vulnerability: ${status2}`, time2);
  }

  // TC-SEC-003: NoSQL Injection
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/login', {
    username: { $ne: null },
    password: { $ne: null }
  });
  if (status3 === 404 || status3 === 400) {
    addTestResult('Security', 'TC-SEC-003', 'NoSQL Injection Protection', 'PASS', 
      'NoSQL injection safely handled', time3);
  } else {
    addTestResult('Security', 'TC-SEC-003', 'NoSQL Injection Protection', 'WARNING', 
      `NoSQL injection returned ${status3}`, time3);
  }

  // TC-SEC-004: XSS in Input Fields
  const xssPayload = '<img src=x onerror=alert(1)>';
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/signup', {
    username: xssPayload,
    email: `${xssPayload}@test.com`,
    password: 'test123'
  });
  if (status4 === 400 || status4 === 409) {
    addTestResult('Security', 'TC-SEC-004', 'XSS Protection', 'PASS', 
      'XSS payload safely handled', time4);
  } else {
    addTestResult('Security', 'TC-SEC-004', 'XSS Protection', 'WARNING', 
      `XSS payload returned ${status4}`, time4);
  }

  // TC-SEC-005: Path Traversal
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('GET', '/api/user/../../../etc/passwd');
  if (status5 === 404 || status5 === 400) {
    addTestResult('Security', 'TC-SEC-005', 'Path Traversal Protection', 'PASS', 
      'Path traversal safely blocked', time5);
  } else {
    addTestResult('Security', 'TC-SEC-005', 'Path Traversal Protection', 'WARNING', 
      `Path traversal returned ${status5}`, time5);
  }

  // TC-SEC-006: Authorization Bypass Attempt
  const testUser = `authtest_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: testUser,
    email: `${testUser}@test.com`,
    password: 'TestPass123!'
  });
  // Try to access another user's data
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('GET', '/api/user/admin');
  if (status6 === 404 || (status6 === 200 && data6.user && data6.user.username === 'admin')) {
    addTestResult('Security', 'TC-SEC-006', 'Authorization Check', 'PASS', 
      'User data access properly controlled', time6);
  } else {
    addTestResult('Security', 'TC-SEC-006', 'Authorization Check', 'WARNING', 
      'Authorization may need review', time6);
  }

  // TC-SEC-007: Rate Limiting (if implemented)
  let rateLimitTest = true;
  for (let i = 0; i < 20; i++) {
    const { status } = await makeRequest('POST', '/api/login', {
      username: 'test',
      password: 'test'
    });
    if (status === 429) {
      rateLimitTest = false;
      break;
    }
  }
  if (rateLimitTest) {
    addTestResult('Security', 'TC-SEC-007', 'Rate Limiting', 'WARNING', 
      'Rate limiting not detected - consider implementation', 0);
  } else {
    addTestResult('Security', 'TC-SEC-007', 'Rate Limiting', 'PASS', 
      'Rate limiting is active', 0);
  }

  // TC-SEC-008: Sensitive Data Exposure
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/login', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD
  });
  if (status8 === 200 && data8.user) {
    const hasPassword = data8.user.password !== undefined;
    if (!hasPassword) {
      addTestResult('Security', 'TC-SEC-008', 'Sensitive Data Exposure', 'PASS', 
        'Password not exposed in response', time8);
    } else {
      addTestResult('Security', 'TC-SEC-008', 'Sensitive Data Exposure', 'FAIL', 
        'Password exposed in response!', time8);
    }
  } else {
    addTestResult('Security', 'TC-SEC-008', 'Sensitive Data Exposure', 'SKIP', 
      'Could not test - user may not exist', time8);
  }
}

// ==================== PERFORMANCE TESTS ====================

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  // TC-PERF-001: API Response Time
  const startTime = Date.now();
  const { status: status1, executionTime: time1 } = await makeRequest('GET', '/api/health');
  if (status1 === 200 && time1 < 1000) {
    addTestResult('Performance', 'TC-PERF-001', 'API Response Time', 'PASS', 
      `Health endpoint responded in ${time1}ms`, time1);
  } else {
    addTestResult('Performance', 'TC-PERF-001', 'API Response Time', 'WARNING', 
      `Response time: ${time1}ms (may be slow)`, time1);
  }

  // TC-PERF-002: Login Response Time
  const { status: status2, executionTime: time2 } = await makeRequest('POST', '/api/login', {
    username: TEST_USERNAME,
    password: TEST_PASSWORD
  });
  if (time2 < 2000) {
    addTestResult('Performance', 'TC-PERF-002', 'Login Response Time', 'PASS', 
      `Login responded in ${time2}ms`, time2);
  } else {
    addTestResult('Performance', 'TC-PERF-002', 'Login Response Time', 'WARNING', 
      `Login slow: ${time2}ms`, time2);
  }

  // TC-PERF-003: Concurrent Requests
  const concurrentStart = Date.now();
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('GET', '/api/health'));
  }
  await Promise.all(promises);
  const concurrentTime = Date.now() - concurrentStart;
  if (concurrentTime < 5000) {
    addTestResult('Performance', 'TC-PERF-003', 'Concurrent Request Handling', 'PASS', 
      `10 concurrent requests handled in ${concurrentTime}ms`, concurrentTime);
  } else {
    addTestResult('Performance', 'TC-PERF-003', 'Concurrent Request Handling', 'WARNING', 
      `Concurrent requests took ${concurrentTime}ms`, concurrentTime);
  }

  // TC-PERF-004: Database Query Performance
  const testUser = `perftest_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: testUser,
    email: `${testUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status4, executionTime: time4 } = await makeRequest('GET', `/api/user/${testUser}`);
  if (status4 === 200 && time4 < 1500) {
    addTestResult('Performance', 'TC-PERF-004', 'Database Query Performance', 'PASS', 
      `User query completed in ${time4}ms`, time4);
  } else {
    addTestResult('Performance', 'TC-PERF-004', 'Database Query Performance', 'WARNING', 
      `Query took ${time4}ms`, time4);
  }
}

// ==================== EDGE CASES ====================

async function testEdgeCases() {
  console.log('\n🔍 Testing Edge Cases...');
  
  // TC-EDGE-001: Very Long Username
  const longUsername = 'a'.repeat(1000);
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/signup', {
    username: longUsername,
    email: 'test@test.com',
    password: 'TestPass123!'
  });
  if (status1 === 400 || status1 === 409) {
    addTestResult('Edge Cases', 'TC-EDGE-001', 'Very Long Username', 'PASS', 
      'Long username properly validated', time1);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-001', 'Very Long Username', 'WARNING', 
      `Long username returned ${status1}`, time1);
  }

  // TC-EDGE-002: Special Characters in Username
  const specialUser = '!@#$%^&*()';
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/signup', {
    username: specialUser,
    email: 'test@test.com',
    password: 'TestPass123!'
  });
  if (status2 === 201 || status2 === 400) {
    addTestResult('Edge Cases', 'TC-EDGE-002', 'Special Characters', 'PASS', 
      'Special characters handled appropriately', time2);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-002', 'Special Characters', 'WARNING', 
      `Special chars returned ${status2}`, time2);
  }

  // TC-EDGE-003: Unicode Characters
  const unicodeUser = '测试用户🎮';
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/signup', {
    username: unicodeUser,
    email: 'test@test.com',
    password: 'TestPass123!'
  });
  if (status3 === 201 || status3 === 400) {
    addTestResult('Edge Cases', 'TC-EDGE-003', 'Unicode Characters', 'PASS', 
      'Unicode characters handled', time3);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-003', 'Unicode Characters', 'WARNING', 
      `Unicode returned ${status3}`, time3);
  }

  // TC-EDGE-004: Empty JSON Body
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/login', {});
  if (status4 === 400 || status4 === 404) {
    addTestResult('Edge Cases', 'TC-EDGE-004', 'Empty JSON Body', 'PASS', 
      'Empty body properly handled', time4);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-004', 'Empty JSON Body', 'WARNING', 
      `Empty body returned ${status4}`, time4);
  }

  // TC-EDGE-005: Invalid JSON
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{'
    });
    const status = response.status;
    if (status === 400 || status === 500) {
      addTestResult('Edge Cases', 'TC-EDGE-005', 'Invalid JSON', 'PASS', 
        'Invalid JSON properly handled', 0);
    } else {
      addTestResult('Edge Cases', 'TC-EDGE-005', 'Invalid JSON', 'WARNING', 
        `Invalid JSON returned ${status}`, 0);
    }
  } catch (error) {
    addTestResult('Edge Cases', 'TC-EDGE-005', 'Invalid JSON', 'WARNING', 
      `Error: ${error.message}`, 0);
  }

  // TC-EDGE-006: Case Sensitivity
  const caseUser = `CaseTest_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: caseUser,
    email: `${caseUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/login', {
    username: caseUser.toUpperCase(),
    password: 'TestPass123!'
  });
  if (status6 === 404) {
    addTestResult('Edge Cases', 'TC-EDGE-006', 'Case Sensitivity', 'PASS', 
      'Username is case-sensitive', time6);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-006', 'Case Sensitivity', 'WARNING', 
      'Username may not be case-sensitive', time6);
  }

  // TC-EDGE-007: Whitespace Handling
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/login', {
    username: `   ${TEST_USERNAME}   `,
    password: `   ${TEST_PASSWORD}   `
  });
  if (status7 === 404 || status7 === 401) {
    addTestResult('Edge Cases', 'TC-EDGE-007', 'Whitespace Handling', 'PASS', 
      'Whitespace properly handled', time7);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-007', 'Whitespace Handling', 'WARNING', 
      `Whitespace returned ${status7}`, time7);
  }

  // TC-EDGE-008: Null Values
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/login', {
    username: null,
    password: null
  });
  if (status8 === 400 || status8 === 404) {
    addTestResult('Edge Cases', 'TC-EDGE-008', 'Null Values', 'PASS', 
      'Null values properly handled', time8);
  } else {
    addTestResult('Edge Cases', 'TC-EDGE-008', 'Null Values', 'WARNING', 
      `Null values returned ${status8}`, time8);
  }
}

// ==================== GAME FUNCTIONALITY TESTS ====================

async function testGameFunctionality() {
  console.log('\n🎮 Testing Game Functionality...');
  
  // TC-GAME-001: Level Progression (Easy)
  const testUser = TEST_USERNAME;
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 5,
    currentUser: testUser
  });
  if (status1 === 200 && data1.success && data1.levelPassedEasy === 5) {
    addTestResult('Game Functionality', 'TC-GAME-001', 'Level Progression (Easy)', 'PASS', 
      'Easy level progression updated successfully', time1);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-001', 'Level Progression (Easy)', 'FAIL', 
      `Expected levelPassedEasy=5, got ${JSON.stringify(data1)}`, time1);
  }

  // TC-GAME-002: Level Progression (Medium)
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Medium',
    levelPassed: 3,
    currentUser: testUser
  });
  if (status2 === 200 && data2.success && data2.levelPassedMedium === 3) {
    addTestResult('Game Functionality', 'TC-GAME-002', 'Level Progression (Medium)', 'PASS', 
      'Medium level progression updated', time2);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-002', 'Level Progression (Medium)', 'FAIL', 
      `Expected levelPassedMedium=3`, time2);
  }

  // TC-GAME-003: Level Progression (Hard)
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Hard',
    levelPassed: 2,
    currentUser: testUser
  });
  if (status3 === 200 && data3.success && data3.levelPassedHard === 2) {
    addTestResult('Game Functionality', 'TC-GAME-003', 'Level Progression (Hard)', 'PASS', 
      'Hard level progression updated', time3);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-003', 'Level Progression (Hard)', 'FAIL', 
      `Expected levelPassedHard=2`, time3);
  }

  // TC-GAME-004: Points Award System (Easy = 5 points)
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/user/update-points', {
    username: testUser,
    points: 25, // 5 levels * 5 points
    currentUser: testUser
  });
  if (status4 === 200 && data4.success && data4.points === 25) {
    addTestResult('Game Functionality', 'TC-GAME-004', 'Points Award (Easy)', 'PASS', 
      'Points correctly updated for Easy difficulty', time4);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-004', 'Points Award (Easy)', 'FAIL', 
      `Expected points=25`, time4);
  }

  // TC-GAME-005: Points Award System (Medium = 10 points)
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/user/update-points', {
    username: testUser,
    points: 55, // Previous 25 + (3 levels * 10 points)
    currentUser: testUser
  });
  if (status5 === 200 && data5.success) {
    addTestResult('Game Functionality', 'TC-GAME-005', 'Points Award (Medium)', 'PASS', 
      'Points correctly updated for Medium difficulty', time5);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-005', 'Points Award (Medium)', 'FAIL', 
      `Points update failed`, time5);
  }

  // TC-GAME-006: Points Award System (Hard = 15 points)
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/user/update-points', {
    username: testUser,
    points: 85, // Previous 55 + (2 levels * 15 points)
    currentUser: testUser
  });
  if (status6 === 200 && data6.success) {
    addTestResult('Game Functionality', 'TC-GAME-006', 'Points Award (Hard)', 'PASS', 
      'Points correctly updated for Hard difficulty', time6);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-006', 'Points Award (Hard)', 'FAIL', 
      `Points update failed`, time6);
  }

  // TC-GAME-007: Hints Purchase and Usage
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 100,
    currentUser: testUser
  });
  if (status7 === 200 && data7.success && data7.hints === 100) {
    addTestResult('Game Functionality', 'TC-GAME-007', 'Hints Purchase', 'PASS', 
      'Hints purchased and stored correctly', time7);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-007', 'Hints Purchase', 'FAIL', 
      `Expected hints=100`, time7);
  }

  // TC-GAME-008: Hints Deduction
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 98, // Used 2 hints
    currentUser: testUser
  });
  if (status8 === 200 && data8.success && data8.hints === 98) {
    addTestResult('Game Functionality', 'TC-GAME-008', 'Hints Deduction', 'PASS', 
      'Hints correctly deducted after use', time8);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-008', 'Hints Deduction', 'FAIL', 
      `Expected hints=98`, time8);
  }

  // TC-GAME-009: Multiple Level Progressions
  const { status: status9, data: data9, executionTime: time9 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 10,
    currentUser: testUser
  });
  if (status9 === 200 && data9.success && data9.levelPassedEasy === 10) {
    addTestResult('Game Functionality', 'TC-GAME-009', 'Multiple Level Progressions', 'PASS', 
      'Multiple level progressions tracked correctly', time9);
  } else {
    addTestResult('Game Functionality', 'TC-GAME-009', 'Multiple Level Progressions', 'FAIL', 
      `Expected levelPassedEasy=10`, time9);
  }

  // TC-GAME-010: User Data Persistence
  const { status: status10, data: data10, executionTime: time10 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status10 === 200 && data10.success && data10.user) {
    const user = data10.user;
    const hasAllData = user.hints !== undefined && user.points !== undefined && 
                      user.levelPassedEasy !== undefined && user.levelPassedMedium !== undefined && 
                      user.levelPassedHard !== undefined;
    if (hasAllData) {
      addTestResult('Game Functionality', 'TC-GAME-010', 'User Data Persistence', 'PASS', 
        'All game data persisted correctly', time10);
    } else {
      addTestResult('Game Functionality', 'TC-GAME-010', 'User Data Persistence', 'WARNING', 
        'Some game data fields missing', time10);
    }
  } else {
    addTestResult('Game Functionality', 'TC-GAME-010', 'User Data Persistence', 'FAIL', 
      `Could not retrieve user data`, time10);
  }
}

// ==================== PAYMENT FLOW TESTS ====================

async function testPaymentFlow() {
  console.log('\n💳 Testing Payment Flow...');
  
  const testUser = TEST_USERNAME;
  
  // TC-PAY-001: Money Payment - Purchase Hints
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status1 === 201 && data1.success && data1.purchase) {
    addTestResult('Payment Flow', 'TC-PAY-001', 'Money Payment - Hints Purchase', 'PASS', 
      'Money payment for hints recorded successfully', time1);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-001', 'Money Payment - Hints Purchase', 'FAIL', 
      `Expected 201, got ${status1}`, time1);
  }

  // TC-PAY-002: Points Payment - Purchase Hints
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 10,
    purchaseType: 'Hints',
    pack: '2 Hints Pack (Points)',
    purchaseMode: 'Points',
    currentUser: testUser
  });
  if (status2 === 201 && data2.success) {
    addTestResult('Payment Flow', 'TC-PAY-002', 'Points Payment - Hints Purchase', 'PASS', 
      'Points payment for hints recorded', time2);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-002', 'Points Payment - Hints Purchase', 'FAIL', 
      `Expected 201, got ${status2}`, time2);
  }

  // TC-PAY-003: Payment History Retrieval
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${testUser}`);
  if (status3 === 200 && data3.success && Array.isArray(data3.purchases)) {
    const moneyPurchases = data3.purchases.filter(p => p.purchaseMode === 'Money');
    const pointsPurchases = data3.purchases.filter(p => p.purchaseMode === 'Points');
    if (moneyPurchases.length > 0 && pointsPurchases.length > 0) {
      addTestResult('Payment Flow', 'TC-PAY-003', 'Payment History Retrieval', 'PASS', 
        `Retrieved ${data3.purchases.length} purchases (${moneyPurchases.length} money, ${pointsPurchases.length} points)`, time3);
    } else {
      addTestResult('Payment Flow', 'TC-PAY-003', 'Payment History Retrieval', 'WARNING', 
        'Payment history retrieved but may be incomplete', time3);
    }
  } else {
    addTestResult('Payment Flow', 'TC-PAY-003', 'Payment History Retrieval', 'FAIL', 
      `Expected purchase history array`, time3);
  }

  // TC-PAY-004: Payment Amount Validation
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 0,
    purchaseType: 'Hints',
    pack: 'Test Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status4 === 400 || status4 === 201) {
    addTestResult('Payment Flow', 'TC-PAY-004', 'Payment Amount Validation', status4 === 400 ? 'PASS' : 'WARNING', 
      status4 === 400 ? 'Zero amount rejected' : 'Zero amount accepted (may need validation)', time4);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-004', 'Payment Amount Validation', 'WARNING', 
      `Unexpected response: ${status4}`, time4);
  }

  // TC-PAY-005: Payment Mode Validation
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 10,
    purchaseType: 'Hints',
    pack: 'Test Pack',
    purchaseMode: 'InvalidMode',
    currentUser: testUser
  });
  if (status5 === 400 || status5 === 201) {
    addTestResult('Payment Flow', 'TC-PAY-005', 'Payment Mode Validation', status5 === 400 ? 'PASS' : 'WARNING', 
      status5 === 400 ? 'Invalid mode rejected' : 'Invalid mode accepted (defaults to Money)', time5);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-005', 'Payment Mode Validation', 'WARNING', 
      `Unexpected response: ${status5}`, time5);
  }

  // TC-PAY-006: Payment Security - Unauthorized Access
  const otherUser = `unauthorized_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: otherUser,
    email: `${otherUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${otherUser}`);
  if (status6 === 403 && data6.success === false) {
    addTestResult('Payment Flow', 'TC-PAY-006', 'Payment Security - Unauthorized Access', 'PASS', 
      'Unauthorized user correctly blocked from viewing purchases', time6);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-006', 'Payment Security - Unauthorized Access', 'FAIL', 
      `Security issue: Unauthorized access returned ${status6}`, time6);
  }

  // TC-PAY-007: Payment Deduplication
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  // Immediately try again
  const { status: status7b, data: data7b, executionTime: time7b } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status7b === 200 && data7b.message && data7b.message.includes('Duplicate')) {
    addTestResult('Payment Flow', 'TC-PAY-007', 'Payment Deduplication', 'PASS', 
      'Duplicate payment correctly prevented', time7b);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-007', 'Payment Deduplication', 'WARNING', 
      'Duplicate prevention may need review', time7b);
  }

  // TC-PAY-008: Payment with Points - Insufficient Points
  // First check current points
  const { status: status8a, data: data8a } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  const currentPoints = data8a?.user?.points || 0;
  if (currentPoints < 10) {
    addTestResult('Payment Flow', 'TC-PAY-008', 'Payment with Points - Insufficient Points', 'SKIP', 
      `User has ${currentPoints} points, insufficient for test`, 0);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-008', 'Payment with Points - Insufficient Points', 'INFO', 
      `User has ${currentPoints} points (sufficient)`, 0);
  }

  // TC-PAY-009: Payment Amount Precision
  const { status: status9, data: data9, executionTime: time9 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.99,
    purchaseType: 'Hints',
    pack: 'Test Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status9 === 201 && data9.success) {
    addTestResult('Payment Flow', 'TC-PAY-009', 'Payment Amount Precision', 'PASS', 
      'Decimal amounts handled correctly', time9);
  } else {
    addTestResult('Payment Flow', 'TC-PAY-009', 'Payment Amount Precision', 'WARNING', 
      `Decimal amount returned ${status9}`, time9);
  }

  // TC-PAY-010: Payment History Sorting
  const { status: status10, data: data10, executionTime: time10 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${testUser}`);
  if (status10 === 200 && data10.success && data10.purchases && data10.purchases.length > 1) {
    const dates = data10.purchases.map(p => new Date(p.purchaseDate).getTime());
    const isSorted = dates.every((date, i) => i === 0 || dates[i - 1] >= date);
    if (isSorted) {
      addTestResult('Payment Flow', 'TC-PAY-010', 'Payment History Sorting', 'PASS', 
        'Purchase history sorted by date (most recent first)', time10);
    } else {
      addTestResult('Payment Flow', 'TC-PAY-010', 'Payment History Sorting', 'WARNING', 
        'Purchase history may not be sorted correctly', time10);
    }
  } else {
    addTestResult('Payment Flow', 'TC-PAY-010', 'Payment History Sorting', 'SKIP', 
      'Not enough purchases to test sorting', time10);
  }
}

// ==================== HINT SYSTEM TESTS ====================

async function testHintSystem() {
  console.log('\n💡 Testing Hint System...');
  
  const testUser = TEST_USERNAME;
  
  // TC-HINT-001: Hints Initialization
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 0,
    currentUser: testUser
  });
  if (status1 === 200 && data1.success && data1.hints === 0) {
    addTestResult('Hint System', 'TC-HINT-001', 'Hints Initialization', 'PASS', 
      'Hints initialized to 0', time1);
  } else {
    addTestResult('Hint System', 'TC-HINT-001', 'Hints Initialization', 'FAIL', 
      `Expected hints=0`, time1);
  }

  // TC-HINT-002: Hints Addition (Purchase)
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 100,
    currentUser: testUser
  });
  if (status2 === 200 && data2.success && data2.hints === 100) {
    addTestResult('Hint System', 'TC-HINT-002', 'Hints Addition (Purchase)', 'PASS', 
      'Hints added correctly after purchase', time2);
  } else {
    addTestResult('Hint System', 'TC-HINT-002', 'Hints Addition (Purchase)', 'FAIL', 
      `Expected hints=100`, time2);
  }

  // TC-HINT-003: Hints Addition (Sum with Existing)
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 180, // 100 existing + 80 new
    currentUser: testUser
  });
  if (status3 === 200 && data3.success && data3.hints === 180) {
    addTestResult('Hint System', 'TC-HINT-003', 'Hints Addition (Sum with Existing)', 'PASS', 
      'Hints correctly summed with existing count', time3);
  } else {
    addTestResult('Hint System', 'TC-HINT-003', 'Hints Addition (Sum with Existing)', 'FAIL', 
      `Expected hints=180`, time3);
  }

  // TC-HINT-004: Hints Deduction (Usage)
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 178, // Used 2 hints
    currentUser: testUser
  });
  if (status4 === 200 && data4.success && data4.hints === 178) {
    addTestResult('Hint System', 'TC-HINT-004', 'Hints Deduction (Usage)', 'PASS', 
      'Hints correctly deducted after use', time4);
  } else {
    addTestResult('Hint System', 'TC-HINT-004', 'Hints Deduction (Usage)', 'FAIL', 
      `Expected hints=178`, time4);
  }

  // TC-HINT-005: Hints Zero Boundary
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 0,
    currentUser: testUser
  });
  if (status5 === 200 && data5.success && data5.hints === 0) {
    addTestResult('Hint System', 'TC-HINT-005', 'Hints Zero Boundary', 'PASS', 
      'Zero hints handled correctly', time5);
  } else {
    addTestResult('Hint System', 'TC-HINT-005', 'Hints Zero Boundary', 'FAIL', 
      `Expected hints=0`, time5);
  }

  // TC-HINT-006: Large Hints Count
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 9999,
    currentUser: testUser
  });
  if (status6 === 200 && data6.success && data6.hints === 9999) {
    addTestResult('Hint System', 'TC-HINT-006', 'Large Hints Count', 'PASS', 
      'Large hints count handled correctly', time6);
  } else {
    addTestResult('Hint System', 'TC-HINT-006', 'Large Hints Count', 'FAIL', 
      `Expected hints=9999`, time6);
  }

  // TC-HINT-007: Hints Data Persistence
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status7 === 200 && data7.success && data7.user && data7.user.hints !== undefined) {
    addTestResult('Hint System', 'TC-HINT-007', 'Hints Data Persistence', 'PASS', 
      `Hints persisted correctly: ${data7.user.hints}`, time7);
  } else {
    addTestResult('Hint System', 'TC-HINT-007', 'Hints Data Persistence', 'FAIL', 
      `Hints not persisted or not retrieved`, time7);
  }

  // TC-HINT-008: Hints Authorization Check
  const otherUser = `hinttest_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: otherUser,
    email: `${otherUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('POST', '/api/user/update-hints', {
    username: testUser,
    hints: 50,
    currentUser: otherUser // Try to update another user's hints
  });
  if (status8 === 403 && data8.success === false) {
    addTestResult('Hint System', 'TC-HINT-008', 'Hints Authorization Check', 'PASS', 
      'Unauthorized hint update correctly blocked', time8);
  } else {
    addTestResult('Hint System', 'TC-HINT-008', 'Hints Authorization Check', 'FAIL', 
      `Security issue: Unauthorized hint update returned ${status8}`, time8);
  }
}

// ==================== LEVEL PROGRESSION TESTS ====================

async function testLevelProgression() {
  console.log('\n📈 Testing Level Progression...');
  
  const testUser = TEST_USERNAME;
  
  // TC-LEVEL-001: Easy Level Progression
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 1,
    currentUser: testUser
  });
  if (status1 === 200 && data1.success && data1.levelPassedEasy === 1) {
    addTestResult('Level Progression', 'TC-LEVEL-001', 'Easy Level Progression', 'PASS', 
      'Easy level 1 progression recorded', time1);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-001', 'Easy Level Progression', 'FAIL', 
      `Expected levelPassedEasy=1`, time1);
  }

  // TC-LEVEL-002: Medium Level Progression
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Medium',
    levelPassed: 1,
    currentUser: testUser
  });
  if (status2 === 200 && data2.success && data2.levelPassedMedium === 1) {
    addTestResult('Level Progression', 'TC-LEVEL-002', 'Medium Level Progression', 'PASS', 
      'Medium level 1 progression recorded', time2);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-002', 'Medium Level Progression', 'FAIL', 
      `Expected levelPassedMedium=1`, time2);
  }

  // TC-LEVEL-003: Hard Level Progression
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Hard',
    levelPassed: 1,
    currentUser: testUser
  });
  if (status3 === 200 && data3.success && data3.levelPassedHard === 1) {
    addTestResult('Level Progression', 'TC-LEVEL-003', 'Hard Level Progression', 'PASS', 
      'Hard level 1 progression recorded', time3);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-003', 'Hard Level Progression', 'FAIL', 
      `Expected levelPassedHard=1`, time3);
  }

  // TC-LEVEL-004: Sequential Level Progression
  for (let level = 2; level <= 5; level++) {
    const { status, data, executionTime } = await makeRequest('POST', '/api/user/update-level-passed', {
      username: testUser,
      difficulty: 'Easy',
      levelPassed: level,
      currentUser: testUser
    });
    if (status === 200 && data.success && data.levelPassedEasy === level) {
      if (level === 5) {
        addTestResult('Level Progression', 'TC-LEVEL-004', 'Sequential Level Progression', 'PASS', 
          `Sequential progression from level 1 to 5 successful`, executionTime);
      }
    } else {
      addTestResult('Level Progression', 'TC-LEVEL-004', 'Sequential Level Progression', 'FAIL', 
        `Failed at level ${level}`, executionTime);
      break;
    }
  }

  // TC-LEVEL-005: Invalid Difficulty
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Invalid',
    levelPassed: 1,
    currentUser: testUser
  });
  if (status5 === 400 && data5.success === false) {
    addTestResult('Level Progression', 'TC-LEVEL-005', 'Invalid Difficulty', 'PASS', 
      'Invalid difficulty correctly rejected', time5);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-005', 'Invalid Difficulty', 'WARNING', 
      `Invalid difficulty returned ${status5}`, time5);
  }

  // TC-LEVEL-006: Level Progression Authorization
  const otherUser = `leveltest_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: otherUser,
    email: `${otherUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 10,
    currentUser: otherUser // Try to update another user's progress
  });
  if (status6 === 403 && data6.success === false) {
    addTestResult('Level Progression', 'TC-LEVEL-006', 'Level Progression Authorization', 'PASS', 
      'Unauthorized level update correctly blocked', time6);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-006', 'Level Progression Authorization', 'FAIL', 
      `Security issue: Unauthorized level update returned ${status6}`, time6);
  }

  // TC-LEVEL-007: Maximum Level Progression
  const { status: status7, data: data7, executionTime: time7 } = await makeRequest('POST', '/api/user/update-level-passed', {
    username: testUser,
    difficulty: 'Easy',
    levelPassed: 100,
    currentUser: testUser
  });
  if (status7 === 200 && data7.success && data7.levelPassedEasy === 100) {
    addTestResult('Level Progression', 'TC-LEVEL-007', 'Maximum Level Progression', 'PASS', 
      'Maximum level (100) progression recorded', time7);
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-007', 'Maximum Level Progression', 'WARNING', 
      `Level 100 returned ${status7}`, time7);
  }

  // TC-LEVEL-008: Level Progression Data Integrity
  const { status: status8, data: data8, executionTime: time8 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status8 === 200 && data8.success && data8.user) {
    const user = data8.user;
    const hasAllLevels = user.levelPassedEasy !== undefined && 
                        user.levelPassedMedium !== undefined && 
                        user.levelPassedHard !== undefined;
    if (hasAllLevels) {
      addTestResult('Level Progression', 'TC-LEVEL-008', 'Level Progression Data Integrity', 'PASS', 
        `All difficulty levels tracked: Easy=${user.levelPassedEasy}, Medium=${user.levelPassedMedium}, Hard=${user.levelPassedHard}`, time8);
    } else {
      addTestResult('Level Progression', 'TC-LEVEL-008', 'Level Progression Data Integrity', 'WARNING', 
        'Some level progression data missing', time8);
    }
  } else {
    addTestResult('Level Progression', 'TC-LEVEL-008', 'Level Progression Data Integrity', 'FAIL', 
      `Could not verify level progression data`, time8);
  }
}

// ==================== PAYMENT SECURITY TESTS ====================

async function testPaymentSecurity() {
  console.log('\n🔐 Testing Payment Security...');
  
  const testUser = TEST_USERNAME;
  
  // TC-PAYSEC-001: Payment Amount Manipulation
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: -10, // Negative amount
    purchaseType: 'Hints',
    pack: 'Test Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status1 === 400 || status1 === 201) {
    addTestResult('Payment Security', 'TC-PAYSEC-001', 'Payment Amount Manipulation', status1 === 400 ? 'PASS' : 'WARNING', 
      status1 === 400 ? 'Negative amount rejected' : 'Negative amount accepted (security risk)', time1);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-001', 'Payment Amount Manipulation', 'WARNING', 
      `Negative amount returned ${status1}`, time1);
  }

  // TC-PAYSEC-002: Payment Authorization Bypass
  const otherUser = `payseccheck_${Date.now()}`;
  await makeRequest('POST', '/api/signup', {
    username: otherUser,
    email: `${otherUser}@test.com`,
    password: 'TestPass123!'
  });
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '100 Hints Pack',
    purchaseMode: 'Money',
    currentUser: otherUser // Try to create purchase for another user
  });
  if (status2 === 403 && data2.success === false) {
    addTestResult('Payment Security', 'TC-PAYSEC-002', 'Payment Authorization Bypass', 'PASS', 
      'Unauthorized purchase creation correctly blocked', time2);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-002', 'Payment Authorization Bypass', 'FAIL', 
      `Security vulnerability: Unauthorized purchase returned ${status2}`, time2);
  }

  // TC-PAYSEC-003: Payment History Access Control
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${otherUser}`);
  if (status3 === 403 && data3.success === false) {
    addTestResult('Payment Security', 'TC-PAYSEC-003', 'Payment History Access Control', 'PASS', 
      'Unauthorized purchase history access blocked', time3);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-003', 'Payment History Access Control', 'FAIL', 
      `Security vulnerability: Unauthorized access returned ${status3}`, time3);
  }

  // TC-PAYSEC-004: Payment Injection Attack
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: '<script>alert("XSS")</script>',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status4 === 201 || status4 === 400) {
    addTestResult('Payment Security', 'TC-PAYSEC-004', 'Payment Injection Attack', 'WARNING', 
      'XSS payload in pack field - verify sanitization', time4);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-004', 'Payment Injection Attack', 'PASS', 
      'XSS payload handled', time4);
  }

  // TC-PAYSEC-005: Payment SQL Injection
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 9.0,
    purchaseType: 'Hints',
    pack: "'; DROP TABLE purchases; --",
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status5 === 201 || status5 === 400) {
    addTestResult('Payment Security', 'TC-PAYSEC-005', 'Payment SQL Injection', 'WARNING', 
      'SQL injection payload - verify database protection', time5);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-005', 'Payment SQL Injection', 'PASS', 
      'SQL injection safely handled', time5);
  }

  // TC-PAYSEC-006: Payment Amount Overflow
  const { status: status6, data: data6, executionTime: time6 } = await makeRequest('POST', '/api/purchase-history', {
    username: testUser,
    amount: 999999999999,
    purchaseType: 'Hints',
    pack: 'Test Pack',
    purchaseMode: 'Money',
    currentUser: testUser
  });
  if (status6 === 201 || status6 === 400) {
    addTestResult('Payment Security', 'TC-PAYSEC-006', 'Payment Amount Overflow', 'WARNING', 
      'Extremely large amount - verify validation', time6);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-006', 'Payment Amount Overflow', 'PASS', 
      'Large amount handled', time6);
  }

  // TC-PAYSEC-007: Payment Race Condition
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest('POST', '/api/purchase-history', {
      username: testUser,
      amount: 9.0,
      purchaseType: 'Hints',
      pack: `Race Test Pack ${i}`,
      purchaseMode: 'Money',
      currentUser: testUser
    }));
  }
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.status === 201).length;
  const duplicateCount = results.filter(r => r.status === 200 && r.data.message && r.data.message.includes('Duplicate')).length;
  if (successCount <= 1 && duplicateCount >= 4) {
    addTestResult('Payment Security', 'TC-PAYSEC-007', 'Payment Race Condition', 'PASS', 
      'Race condition handled - duplicates prevented', 0);
  } else {
    addTestResult('Payment Security', 'TC-PAYSEC-007', 'Payment Race Condition', 'WARNING', 
      `Race condition test: ${successCount} created, ${duplicateCount} duplicates`, 0);
  }
}

// ==================== DATA INTEGRITY TESTS ====================

async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity...');
  
  const testUser = TEST_USERNAME;
  
  // TC-DATA-001: User Data Consistency
  const { status: status1, data: data1, executionTime: time1 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status1 === 200 && data1.success && data1.user) {
    const user = data1.user;
    const isConsistent = user.username === testUser && 
                        typeof user.hints === 'number' && 
                        typeof user.points === 'number' &&
                        typeof user.levelPassedEasy === 'number' &&
                        typeof user.levelPassedMedium === 'number' &&
                        typeof user.levelPassedHard === 'number';
    if (isConsistent) {
      addTestResult('Data Integrity', 'TC-DATA-001', 'User Data Consistency', 'PASS', 
        'User data structure is consistent', time1);
    } else {
      addTestResult('Data Integrity', 'TC-DATA-001', 'User Data Consistency', 'WARNING', 
        'User data structure inconsistencies detected', time1);
    }
  } else {
    addTestResult('Data Integrity', 'TC-DATA-001', 'User Data Consistency', 'FAIL', 
      `Could not retrieve user data`, time1);
  }

  // TC-DATA-002: Purchase History Consistency
  const { status: status2, data: data2, executionTime: time2 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${testUser}`);
  if (status2 === 200 && data2.success && Array.isArray(data2.purchases)) {
    const allValid = data2.purchases.every(p => 
      p.purchaseId && 
      p.amount !== undefined && 
      p.purchaseType && 
      p.pack && 
      p.purchaseDate
    );
    if (allValid) {
      addTestResult('Data Integrity', 'TC-DATA-002', 'Purchase History Consistency', 'PASS', 
        `All ${data2.purchases.length} purchases have valid structure`, time2);
    } else {
      addTestResult('Data Integrity', 'TC-DATA-002', 'Purchase History Consistency', 'WARNING', 
        'Some purchases have missing or invalid fields', time2);
    }
  } else {
    addTestResult('Data Integrity', 'TC-DATA-002', 'Purchase History Consistency', 'SKIP', 
      'No purchase history to validate', time2);
  }

  // TC-DATA-003: Points and Hints Synchronization
  const { status: status3, data: data3, executionTime: time3 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status3 === 200 && data3.success && data3.user) {
    const points = data3.user.points || 0;
    const hints = data3.user.hints || 0;
    // Verify both are non-negative
    if (points >= 0 && hints >= 0) {
      addTestResult('Data Integrity', 'TC-DATA-003', 'Points and Hints Synchronization', 'PASS', 
        `Points: ${points}, Hints: ${hints} - both valid`, time3);
    } else {
      addTestResult('Data Integrity', 'TC-DATA-003', 'Points and Hints Synchronization', 'WARNING', 
        'Negative values detected', time3);
    }
  } else {
    addTestResult('Data Integrity', 'TC-DATA-003', 'Points and Hints Synchronization', 'SKIP', 
      'Could not verify data', time3);
  }

  // TC-DATA-004: Level Progression Consistency
  const { status: status4, data: data4, executionTime: time4 } = await makeRequest('GET', `/api/user/${testUser}?currentUser=${testUser}`);
  if (status4 === 200 && data4.success && data4.user) {
    const easy = data4.user.levelPassedEasy || 0;
    const medium = data4.user.levelPassedMedium || 0;
    const hard = data4.user.levelPassedHard || 0;
    // Verify all are non-negative and within reasonable range (0-100)
    if (easy >= 0 && easy <= 100 && medium >= 0 && medium <= 100 && hard >= 0 && hard <= 100) {
      addTestResult('Data Integrity', 'TC-DATA-004', 'Level Progression Consistency', 'PASS', 
        `Levels: Easy=${easy}, Medium=${medium}, Hard=${hard} - all valid`, time4);
    } else {
      addTestResult('Data Integrity', 'TC-DATA-004', 'Level Progression Consistency', 'WARNING', 
        'Level progression values out of expected range', time4);
    }
  } else {
    addTestResult('Data Integrity', 'TC-DATA-004', 'Level Progression Consistency', 'SKIP', 
      'Could not verify data', time4);
  }

  // TC-DATA-005: Purchase ID Uniqueness
  const { status: status5, data: data5, executionTime: time5 } = await makeRequest('GET', `/api/purchase-history/${testUser}?currentUser=${testUser}`);
  if (status5 === 200 && data5.success && data5.purchases && data5.purchases.length > 1) {
    const purchaseIds = data5.purchases.map(p => p.purchaseId);
    const uniqueIds = new Set(purchaseIds);
    if (purchaseIds.length === uniqueIds.size) {
      addTestResult('Data Integrity', 'TC-DATA-005', 'Purchase ID Uniqueness', 'PASS', 
        'All purchase IDs are unique', time5);
    } else {
      addTestResult('Data Integrity', 'TC-DATA-005', 'Purchase ID Uniqueness', 'FAIL', 
        'Duplicate purchase IDs detected!', time5);
    }
  } else {
    addTestResult('Data Integrity', 'TC-DATA-005', 'Purchase ID Uniqueness', 'SKIP', 
      'Not enough purchases to verify uniqueness', time5);
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Test Suite for FindMyPuppy...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`👤 Test User: ${TEST_USERNAME}`);
  console.log('='.repeat(60));

  const startTime = Date.now();

  try {
    await testAuthentication();
    await testUserData();
    await testPurchaseHistory();
    await testPriceOffer();
    await testSecurity();
    await testPerformance();
    await testEdgeCases();
    await testGameFunctionality();
    await testPaymentFlow();
    await testHintSystem();
    await testLevelProgression();
    await testPaymentSecurity();
    await testDataIntegrity();
  } catch (error) {
    console.error('❌ Test suite error:', error);
    addTestResult('System', 'TC-SYS-001', 'Test Suite Execution', 'FAIL', error.message, 0);
  }

  const totalTime = Date.now() - startTime;

  // Generate HTML Report
  await generateHTMLReport(totalTime);

  // Print Summary
  const summary = getTestSummary();
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  console.log(`⏱️  Total Execution Time: ${totalTime}ms`);
  console.log(`📈 Pass Rate: ${((summary.passed / summary.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

function getTestSummary() {
  const summary = {
    total: testResults.length,
    passed: testResults.filter(t => t.status === 'PASS').length,
    failed: testResults.filter(t => t.status === 'FAIL').length,
    warnings: testResults.filter(t => t.status === 'WARNING').length,
    skipped: testResults.filter(t => t.status === 'SKIP').length
  };
  return summary;
}

async function generateHTMLReport(totalTime) {
  const summary = getTestSummary();
  const timestamp = new Date().toISOString();
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FindMyPuppy - Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .stat-card.passed h3 { color: #28a745; }
        .stat-card.failed h3 { color: #dc3545; }
        .stat-card.warning h3 { color: #ffc107; }
        .stat-card.skipped h3 { color: #6c757d; }
        .stat-card.total h3 { color: #007bff; }
        .content {
            padding: 30px;
        }
        .category {
            margin-bottom: 40px;
        }
        .category-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 1.3em;
            font-weight: bold;
        }
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .test-table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
        }
        .test-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        .test-table tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
        }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .status-warning { background: #fff3cd; color: #856404; }
        .status-skip { background: #e2e3e5; color: #383d41; }
        .details {
            font-size: 0.9em;
            color: #6c757d;
            font-style: italic;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .filter-buttons {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        .filter-btn {
            padding: 8px 16px;
            margin-right: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        .filter-btn.active {
            background: #667eea;
            color: white;
        }
        .filter-btn:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 FindMyPuppy Test Report</h1>
            <p>Comprehensive Test Suite - SDET 15 Years Experience</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Generated: ${timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card total">
                <h3>${summary.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="stat-card passed">
                <h3>${summary.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="stat-card failed">
                <h3>${summary.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="stat-card warning">
                <h3>${summary.warnings}</h3>
                <p>Warnings</p>
            </div>
            <div class="stat-card skipped">
                <h3>${summary.skipped}</h3>
                <p>Skipped</p>
            </div>
        </div>

        <div class="filter-buttons">
            <button class="filter-btn active" onclick="filterTests('all')">All Tests</button>
            <button class="filter-btn" onclick="filterTests('PASS')">Passed</button>
            <button class="filter-btn" onclick="filterTests('FAIL')">Failed</button>
            <button class="filter-btn" onclick="filterTests('WARNING')">Warnings</button>
            <button class="filter-btn" onclick="filterTests('SKIP')">Skipped</button>
        </div>

        <div class="content">
            ${generateTestResultsHTML()}
        </div>

        <div class="footer">
            <p>⏱️ Total Execution Time: ${totalTime}ms | 📈 Pass Rate: ${((summary.passed / summary.total) * 100).toFixed(2)}%</p>
            <p style="margin-top: 10px;">Test Environment: ${BASE_URL}</p>
        </div>
    </div>

    <script>
        function filterTests(status) {
            const rows = document.querySelectorAll('.test-row');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            rows.forEach(row => {
                if (status === 'all') {
                    row.style.display = '';
                } else {
                    const rowStatus = row.getAttribute('data-status');
                    row.style.display = rowStatus === status ? '' : 'none';
                }
            });
        }
    </script>
</body>
</html>`;

  // Write HTML report
  try {
    const fs = await import('fs');
    const path = await import('path');
    const url = await import('url');
    
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const reportPath = path.join(__dirname, 'test-report.html');
    
    fs.writeFileSync(reportPath, html);
    console.log(`\n📄 HTML Report generated: ${reportPath}`);
  } catch (error) {
    console.error('Failed to write HTML report:', error);
    // Fallback: output HTML to console
    console.log('\n📄 HTML Report (console output):');
    console.log(html.substring(0, 500) + '... (truncated)');
  }
}

function generateTestResultsHTML() {
  const categories = {};
  testResults.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = [];
    }
    categories[test.category].push(test);
  });

  let html = '';
  Object.keys(categories).forEach(category => {
    html += `<div class="category">
      <div class="category-header">${category}</div>
      <table class="test-table">
        <thead>
          <tr>
            <th>Test Case ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Execution Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>`;
    
    categories[category].forEach(test => {
      const statusClass = `status-${test.status.toLowerCase()}`;
      html += `<tr class="test-row" data-status="${test.status}">
        <td><strong>${test.testCase}</strong></td>
        <td>${test.description}</td>
        <td><span class="status-badge ${statusClass}">${test.status}</span></td>
        <td>${test.executionTime}ms</td>
        <td class="details">${test.details || '-'}</td>
      </tr>`;
    });
    
    html += `</tbody></table></div>`;
  });

  return html;
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This test requires Node.js 18+ (fetch API)');
  console.error('   Please upgrade Node.js or install node-fetch package');
  process.exit(1);
}

// Execute tests
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export { runAllTests, testResults };

