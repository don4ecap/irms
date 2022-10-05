const production = process.env.NODE_ENV === 'production'

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
  ],
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
    'no-debugger': production ? 2 : 0,
    'no-unused-vars': production ? 2 : 1,
  },
}
