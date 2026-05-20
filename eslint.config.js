'use strict';

const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**', '.nyc_output/**']
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-unused-vars': [
        'error',
        { args: 'none', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }
      ]
    }
  },
  {
    files: ['lib/**/*.js'],
    languageOptions: {
      globals: {
        unescape: 'readonly'
      }
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022
    }
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022
    }
  }
];
