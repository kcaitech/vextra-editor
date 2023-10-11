const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

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
        "/dist/",
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    maxConcurrency: 10,
    maxWorkers: 1,
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: "<rootDir>/"
    }),
};
