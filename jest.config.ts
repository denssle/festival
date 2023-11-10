import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	transform: { "^.+\\.tsx?$": ["ts-jest", {"rootDir": "."}] },
};

export default config;

module.exports = config;