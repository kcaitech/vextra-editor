module.exports = {
    preset: "ts-jest",
    // testEnvironment: "node",
    testEnvironment: "jsdom",
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        // "**/?(*.)+(spec|test).[jt]s?(x)",
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/build/"
    ],
    transform: { "^.+\\.tsx?$": "ts-jest" },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
};
