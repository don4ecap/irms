const production = process.env.NODE_ENV === 'production'

const [OFF, WARN, ERROR] = [0, 1, 2]

module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  plugins: ['vue', 'prettier', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  overrides: [
    // For vue
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-debugger': production ? ERROR : OFF,
    'no-unused-vars': production ? ERROR : WARN,
    '@typescript-eslint/ban-ts-comment': OFF,
    '@typescript-eslint/no-explicit-any': OFF,
  },
}
