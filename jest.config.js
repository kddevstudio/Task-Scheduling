module.exports = {
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json',
			diagnostics: {
				warnOnly: true
			}
		}
	},
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: [
		'**/tests/**/*.test.(ts|js)'
	],
	testEnvironment: 'node',
	testTimeout: 10000
};