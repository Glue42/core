module.exports = {
    extends: [
        '../../.eslintrc.json',
        'plugin:react/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
        'plugin:jest/recommended',
    ],
    parser: "@typescript-eslint/parser",
    rules: {
        'prettier/prettier': ["error", {
            "endOfLine":"auto"
        }],
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/jsx-curly-brace-presence': 'error',
        '@typescript-eslint/ban-ts-ignore': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
        '@typescript-eslint/array-type': ['error', 'array-simple'],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-member-accessibility': ['error',
            {
                accessibility: 'explicit',
                overrides: {
                    constructors: 'off',
                },
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}
