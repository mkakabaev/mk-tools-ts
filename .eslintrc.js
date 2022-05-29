module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.eslint.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended',
        //'plugin:prettier/recommended',
        'prettier',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    // files: ['*.ts', '*.tsx'], // Your TypeScript files extension
    ignorePatterns: ['dist/**', '*.js'],
    rules: {
        '@typescript-eslint/semi': ['warn'],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': ['error'],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-use-before-define': ['error', { functions: true, classes: false }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/await-thenable': ['warn'],
        '@typescript-eslint/no-namespace': 'off',
    },
};
