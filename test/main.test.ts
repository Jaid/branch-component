import {expect, test} from 'bun:test'

const {default: branchComponent} = await import('#src/main.ts')

test('should run', () => {
  const result = branchComponent()
  expect(result).toBe('branch-component') // TODO Test actual functionality
})
