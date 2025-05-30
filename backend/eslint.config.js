import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '../dist', '../node_modules', '../dev-dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    rules: {
      // Boolean variable naming convention enforcement
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['camelCase'],
          filter: {
            regex: '^(loading|visible|enabled|disabled|active|selected|checked|valid|success|error|show|hide|open|closed|expanded|collapsed|complete|edit|delete|create|update|submit|save|cancel|confirm|toggle|switch)$',
            match: true,
          },
          custom: {
            regex: '^(is|has|should|can|will|did|was|were|are|am|be|been|being)[A-Z]',
            match: true,
          },
          failureMessage: 'Boolean-like variable names should start with is, has, should, can, will, did, was, were, are, am, be, been, or being'
        }
      ],
      // Additional code quality rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    },
  },
)
