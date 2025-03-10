import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import pluginImport from 'eslint-plugin-import'
import pluginNode from 'eslint-plugin-n'

const config = [
  {
    ignores: ['lib'],
    languageOptions: {
      globals: {
        ...globals.node
      },

      ecmaVersion: 2020,
      sourceType: 'module'
    },

    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-use-before-define': 'error',
      'no-await-in-loop': 'error',
      'n/exports-style': [0, 'error'],
      'import/first': 'error',
      'import/no-anonymous-default-export': 'error',
      'import/no-unassigned-import': 'error',
      'import/no-internal-modules': [
        'error',
        {
          allow: ['src/**']
        }
      ]
    },
    plugins: {
      import: pluginImport,
      n: pluginNode,
      prettier: prettier
    }
  },
  {
    files: ['test/{**/,}*.js'],
    languageOptions: {
      globals: { ...globals.mocha }
    }
  }
]

export default config
