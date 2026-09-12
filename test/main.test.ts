/* eslint-disable unicorn/no-thenable */
import {describe, expect, test} from 'bun:test'

import {Fragment, isValidElement} from 'react'

import branch from '#src/main.ts'

const child = 'child'
const Fallback = () => 'fallback'
const Success = () => 'success'
describe('positive conditions', () => {
  test('if renders for truthy values', () => {
    expect(branch({
      if: true,
      children: child,
    })).toBe(child)
    expect(branch({
      if: false,
      children: child,
    })).toBeNull()
  })
  test('condition is an alias for if', () => {
    expect(branch({
      condition: 1,
      children: child,
    })).toBe(child)
    expect(branch({
      condition: 0,
      children: child,
    })).toBeNull()
  })
})
describe('negative conditions', () => {
  test('unless renders for falsy values', () => {
    expect(branch({
      unless: false,
      children: child,
    })).toBe(child)
    expect(branch({
      unless: true,
      children: child,
    })).toBeNull()
  })
  test('not is an alias for unless', () => {
    expect(branch({
      not: null,
      children: child,
    })).toBe(child)
    expect(branch({
      not: {},
      children: child,
    })).toBeNull()
  })
})
describe('collection conditions', () => {
  test('some renders when at least one value is truthy', () => {
    expect(branch({
      some: [false, 1, false],
      children: child,
    })).toBe(child)
    expect(branch({
      some: [false, 0, null],
      children: child,
    })).toBeNull()
    expect(branch({
      some: [],
      children: child,
    })).toBeNull()
  })
  test('none renders when no values are truthy', () => {
    expect(branch({
      none: [false, 0, null],
      children: child,
    })).toBe(child)
    expect(branch({
      none: [false, 1, false],
      children: child,
    })).toBeNull()
    expect(branch({
      none: [],
      children: child,
    })).toBe(child)
  })
  test('all renders when every value is truthy', () => {
    expect(branch({
      all: [true, 1, {}],
      children: child,
    })).toBe(child)
    expect(branch({
      all: [true, 0, {}],
      children: child,
    })).toBeNull()
    expect(branch({
      all: [],
      children: child,
    })).toBe(child)
  })
})
describe('combined conditions', () => {
  test('ANDs positive and negative conditions', () => {
    expect(branch({
      if: true,
      not: false,
      children: child,
    })).toBe(child)
    expect(branch({
      if: false,
      not: false,
      children: child,
    })).toBeNull()
    expect(branch({
      if: true,
      not: true,
      children: child,
    })).toBeNull()
  })
  test('allows aliases to be combined', () => {
    expect(branch({
      if: true,
      condition: 1,
      unless: false,
      not: null,
      children: child,
    })).toBe(child)
    expect(branch({
      if: true,
      condition: 0,
      children: child,
    })).toBeNull()
  })
  test('ANDs scalar and collection conditions', () => {
    expect(branch({
      if: true,
      not: false,
      some: [false, true],
      none: [false, null],
      all: [true, 1],
      children: child,
    })).toBe(child)
    expect(branch({
      if: true,
      not: false,
      some: [false, true],
      none: [false, null],
      all: [true, 0],
      children: child,
    })).toBeNull()
  })
})
describe('then', () => {
  test('returns a then node when all conditions pass', () => {
    expect(branch({
      if: true,
      then: 'success',
    })).toBe('success')
  })
  test('ignores then when a condition fails', () => {
    expect(branch({
      if: false,
      then: 'success',
    })).toBeNull()
  })
  test('uses else instead of then when a condition fails', () => {
    expect(branch({
      if: false,
      then: 'success',
      else: 'fallback',
    })).toBe('fallback')
  })
  test('turns a then component into an element', () => {
    const result = branch({
      if: true,
      then: Success,
    })
    expect(isValidElement(result)).toBeTrue()
    if (isValidElement(result)) {
      expect(result.type).toBe(Success)
    }
  })
  test('renders then before children in a fragment when both are supplied', () => {
    const result = branch({
      if: true,
      then: 'then',
      children: 'children',
    })
    expect(isValidElement<{children: Array<unknown>}>(result)).toBeTrue()
    if (isValidElement<{children: Array<unknown>}>(result)) {
      expect(result.type).toBe(Fragment)
      expect(result.props.children).toEqual(['then', 'children'])
    }
  })
})
describe('else', () => {
  test('returns an else node when a condition fails', () => {
    expect(branch({
      if: false,
      else: 'fallback',
      children: child,
    })).toBe('fallback')
  })
  test('ignores else when all conditions pass', () => {
    expect(branch({
      if: true,
      not: false,
      else: 'fallback',
      children: child,
    })).toBe(child)
  })
  test('turns an else component into an element', () => {
    const result = branch({
      if: false,
      else: Fallback,
      children: child,
    })
    expect(isValidElement(result)).toBeTrue()
    if (isValidElement(result)) {
      expect(result.type).toBe(Fallback)
    }
  })
})
test('preserves a missing child as undefined when all conditions pass', () => {
  expect(branch({
    if: true,
    not: false,
  })).toBeUndefined()
})
test('only exposes the default component at runtime', async () => {
  const module = await import('#src/main.ts')
  expect(Object.keys(module)).toEqual(['default'])
})
