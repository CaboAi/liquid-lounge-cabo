module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
    ],
    'no-duplicate-imports': 'error',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
        ignoreCase: true,
      },
    ],
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.turbo',
    '*.config.js',
    '*.config.ts',
  ],
  overrides: [
    {
      files: ['apps/mobile/**/*.{ts,tsx}'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
      plugins: ['react', 'react-hooks', 'react-native'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-native/no-unused-styles': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-raw-text': ['warn', { skip: ['Button'] }],
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
  ],
};