/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  testPathIgnorePatterns: ['dist'],
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests', 'dist'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },

};