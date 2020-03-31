const COVERAGE_THRESHOLD = 70;

module.exports = {
    preset: 'ts-jest',
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    transform: {
        '.(ts|tsx|js)': 'ts-jest',
    },
    testRegex: '/tests/.*\\.spec\\.(ts|tsx)$',
    //testRegex: "/tests/.*.(ts|tsx)$",
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.json',
        },
    },
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/tests/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/_jest/setupEnzyme.ts'],
    coveragePathIgnorePatterns: ['/tests/', '/node_modules/', '/docs/', '/dist/', '/coverage/', '/overrides/'],
    coverageThreshold: {
        global: {
            branches: COVERAGE_THRESHOLD,
            functions: COVERAGE_THRESHOLD,
            lines: COVERAGE_THRESHOLD,
            statements: -12,
        },
    },
};
