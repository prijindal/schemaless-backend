/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  moduleFileExtensions: ["ts", "js", "tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: ["src/**/*.ts", "app/**/*.(ts|tsx)"],
  coveragePathIgnorePatterns: ["/src/build/"],
  testMatch: ["**/test/**/*.test.(ts|js)", "**/src/**/*.test.(ts|js)"],
  testEnvironment: "node",
  collectCoverage: true,
  maxWorkers: 1
};

// eslint-disable-next-line no-undef
module.exports = config;