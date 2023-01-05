const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../core/src/library/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'jsdom',
};