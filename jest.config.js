/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/src/build/"],
  testMatch: ["**/test/**/*.test.(ts|js)", "**/src/**/*.test.(ts|js)"],
  testEnvironment: "node",
  collectCoverage: true,
};

// eslint-disable-next-line no-undef
module.exports = config;
