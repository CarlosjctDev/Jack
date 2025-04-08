import globals from 'globals';
import teslint from 'typescript-eslint';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';   
import unusedImports from 'eslint-plugin-unused-imports';
import airbnbBase from 'eslint-config-airbnb-base';
import airbnbBaseTypescript from 'eslint-config-airbnb-base-typescript';

/** @type {import('eslint').linter.Config[]} */
export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {  
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.node,
                Bun: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': teslint,
            'unused-imports': unusedImports
        },
        rules: {
           ...airbnbBase.rules,
           ...airbnbBaseTypescript.rules,
           'no-unused-vars': 'off',           
           'unused-imports/no-unused-vars': [
                'warn',
                {
                     vars: 'all',
                     varsIgnorePattern: '^_',
                     args: 'after-used',
                     argsIgnorePattern: '^_',                     
                     caughtErrors: 'none',
                     caughtErrorsIgnorePattern: '^_'
                },
           ],
        },
        settings : {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx']
                },
                Bundler: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx']
                },
            }
        }
    }
]
