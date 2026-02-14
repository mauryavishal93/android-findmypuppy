# FindMyPuppy - Test Suite

## Overview

Comprehensive test suite covering functional, non-functional, security, and edge case scenarios for the FindMyPuppy game application.

## Test Categories

### 1. Authentication Tests (11 test cases)
- Valid/Invalid login scenarios
- Signup validation
- Security (SQL injection, XSS protection)
- Password hashing verification

### 2. User Data Management Tests (10 test cases)
- CRUD operations for user data
- Level progression tracking
- Data validation
- Edge cases (negative values, large values)

### 3. Purchase History Tests (7 test cases)
- Money and Points purchases
- Duplicate prevention
- User data isolation
- Validation

### 4. Price Offer Tests (4 test cases)
- Get/Update price offers
- Validation
- Data integrity

### 5. Security Tests (8 test cases)
- SQL/NoSQL injection protection
- XSS protection
- Path traversal protection
- Authorization checks
- Rate limiting
- Sensitive data exposure

### 6. Performance Tests (4 test cases)
- API response times
- Concurrent request handling
- Database query performance

### 7. Edge Cases (8 test cases)
- Long inputs
- Special characters
- Unicode
- Invalid JSON
- Null values
- Whitespace handling

**Total: 70+ Test Cases**

## Prerequisites

1. **Backend Server**: Must be running on `http://localhost:5174`
   ```bash
   npm run server
   ```

2. **Node.js**: Version 18+ (for native fetch API support)
   - If using Node.js < 18, install `node-fetch`:
     ```bash
     npm install node-fetch
     ```

3. **MongoDB**: Database connection must be active

## Running Tests

### Basic Execution
```bash
npm run test
```

### Generate and Open Report
```bash
npm run test:report
```

### Custom API URL
```bash
TEST_API_URL=https://your-api-url.com npm run test
```

## Test Report

After test execution, an HTML report is generated at:
```
tests/test-report.html
```

The report includes:
- ✅ Test summary with pass/fail/warning counts
- 📊 Detailed results by category
- ⏱️ Execution times
- 📈 Pass rate percentage
- 🔍 Filterable test results

## Test Results Status

- **PASS** ✅: Test passed successfully
- **FAIL** ❌: Test failed - issue identified
- **WARNING** ⚠️: Test passed but potential concern
- **SKIP** ⏭️: Test skipped (preconditions not met)

## Test Coverage

### Functional Coverage
- ✅ Authentication (Login/Signup)
- ✅ User data management
- ✅ Purchase history
- ✅ Price offers
- ✅ Level progression

### Security Coverage
- ✅ SQL Injection protection
- ✅ NoSQL Injection protection
- ✅ XSS protection
- ✅ Path traversal protection
- ✅ Authorization checks
- ✅ Sensitive data exposure
- ✅ CORS configuration

### Non-Functional Coverage
- ✅ Performance (response times)
- ✅ Concurrent request handling
- ✅ Data validation
- ✅ Error handling

### Edge Cases
- ✅ Long inputs
- ✅ Special characters
- ✅ Unicode support
- ✅ Invalid inputs
- ✅ Null/empty values

## Notes

- Tests are designed to be **non-destructive** where possible
- Some tests may create test users (with timestamp-based names)
- Security tests verify protection mechanisms without causing harm
- Performance thresholds may need adjustment based on your infrastructure
- Edge cases help identify potential production issues

## Troubleshooting

### Tests Failing
1. Ensure backend server is running
2. Check MongoDB connection
3. Verify API URL is correct
4. Check server logs for errors

### Connection Errors
- Verify server is accessible at the configured URL
- Check firewall/network settings
- Ensure CORS is properly configured

### Timeout Issues
- Increase timeout values in test-runner.js if needed
- Check server performance
- Verify database connection speed

## Test Maintenance

### Adding New Tests
1. Add test function in `test-runner.js`
2. Call function in `runAllTests()`
3. Update `TEST_SPECIFICATION.md`
4. Update this README

### Modifying Tests
- Update test logic in respective test function
- Update specification document
- Re-run tests to verify changes

## Contact

For test-related questions or issues, refer to the test specification document or review the test code.

---

**Last Updated**: ${new Date().toISOString()}

