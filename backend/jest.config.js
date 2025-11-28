module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // ✅ FIXED PATH
  verbose: true,
  detectOpenHandles: true
};
