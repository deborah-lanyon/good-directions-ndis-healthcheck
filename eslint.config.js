import { configApp } from '@adonisjs/eslint-config'
export default configApp(
  {},
  {
    rules: {
      // Disable pedantic rules that block CI
      '@unicorn/no-await-expression-member': 'off',
      '@unicorn/filename-case': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  }
)
