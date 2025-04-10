module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    // Add any specific rules you want to override or configure here
    'react/prop-types': 'off', // Disable prop-types rule (if using TypeScript or not using prop-types)
    'no-unused-vars': 'warn', // Or 'error' if you want unused variables to be errors
    // Example of a custom rule:
    // 'react/jsx-uses-react': 'off', // If you are using React 17+ with the new JSX transform
    // 'react/react-in-jsx-scope': 'off', // If you are using React 17+ with the new JSX transform
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  ignorePatterns: ['node_modules/'], // Add any files or directories to ignore here
};