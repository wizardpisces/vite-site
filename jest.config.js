module.exports = {
    watchPathIgnorePatterns: ['/node_modules/', '/.git/'],
    testMatch: ['<rootDir>/src/**/__tests__/**/*spec.[jt]s?(x)'],
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
}