// jest.config.js

module.exports = {
  // Use node environment for backend testing
  testEnvironment: 'node', 
  // Look for test files ending in .test.js or .spec.js
  testMatch: ['**/__tests__/**/*.test.js'],
  // Set up files that run before the tests start (like db connection)
  setupFilesAfterEnv: ['./test/setup.js'], 
  // Collect code coverage data (optional but great for Capstone)
  collectCoverage: true, 
  coverageDirectory: 'coverage',
};