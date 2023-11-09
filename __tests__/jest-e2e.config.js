module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testRegex: '.e2e.ts$',
  testTimeout: 30000,
};
