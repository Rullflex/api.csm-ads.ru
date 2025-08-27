import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'n/prefer-global/process': ['off'],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'vitest/no-import-node-test': 'off',
    'no-console': 'off',
  },
})
