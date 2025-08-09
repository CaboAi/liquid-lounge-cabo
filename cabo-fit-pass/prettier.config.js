/**
 * @type {import("prettier").Config}
 */
const config = {
  // Basic formatting options
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // Plugin configurations
  plugins: [
    'prettier-plugin-tailwindcss', // Must be loaded last
  ],

  // Tailwind CSS plugin options
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['clsx', 'cn', 'cva'],

  // Override specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
        parser: 'json-stringify',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        tabWidth: 2,
        bracketSameLine: true,
      },
    },
    {
      files: ['package.json', 'package-lock.json'],
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
    {
      files: '*.svg',
      options: {
        parser: 'html',
        printWidth: 120,
      },
    },
  ],

  // Ignore specific patterns
  ignore: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    '.vercel/**',
    '.turbo/**',
    'public/**',
    '*.min.js',
    '*.min.css',
    'CHANGELOG.md',
    'pnpm-lock.yaml',
    'yarn.lock',
    'package-lock.json',
  ],
}

module.exports = config