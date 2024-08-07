import config from '../jest.config.js';

export default {
    ...config,
    rootDir: '../',
    moduleNameMapper: {
        '^ix$': '<rootDir>/src/node',
        '^ix(.*)\\.js$': '<rootDir>/src$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        ...config.transform,
        '^.+\\.js$': [
            'ts-jest',
            {
                diagnostics: false,
                tsconfig: '<rootDir>/spec/tsconfig/tsconfig.src.json',
                useESM: true,
            },
        ],
        '^.+\\.ts$': [
            'ts-jest',
            {
                diagnostics: false,
                tsconfig: '<rootDir>/spec/tsconfig/tsconfig.src.json',
                useESM: true,
            },
        ],
    },
};
