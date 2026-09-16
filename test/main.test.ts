/* eslint-disable unicorn/no-thenable */
import type {ReactNode} from 'react'

import {describe, expect, test} from 'bun:test'

import {createElement, Fragment, isValidElement} from 'react'

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
})
describe('negative conditions', () => {
  test('not renders for falsy values', () => {
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
  test('defers a lazy then function until React renders the selected branch', () => {
    let calls = 0
    const lazy = () => {
      calls++
      return 'lazy success'
    }
    const ignored = branch({
      if: false,
      then: lazy,
    })
    expect(ignored).toBeNull()
    expect(calls).toBe(0)
    const result = branch({
      if: true,
      then: lazy,
    })
    expect(calls).toBe(0)
    expect(isValidElement(result)).toBeTrue()
    if (isValidElement(result) && typeof result.type === 'function') {
      expect((result.type as () => unknown)()).toBe('lazy success')
      expect(calls).toBe(1)
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
describe('className', () => {
  test('filters nullish class names before passing them', () => {
    const result = branch({
      if: true,
      className: ['branch', undefined, null, 'active'],
      then: Success,
    })
    expect(isValidElement<{className?: string}>(result)).toBeTrue()
    if (isValidElement<{className?: string}>(result)) {
      expect(result.props.className).toBe('branch active')
    }
  })
  test('does not pass className when every provided value is nullish', () => {
    const result = branch({
      if: true,
      className: [undefined, null],
      then: Success,
    })
    expect(isValidElement<{className?: string}>(result)).toBeTrue()
    if (isValidElement<{className?: string}>(result)) {
      expect(result.props.className).toBeUndefined()
    }
  })
  test('passes className to bare then and else components', () => {
    const thenResult = branch({
      if: true,
      className: 'branch',
      then: Success,
    })
    expect(isValidElement<{className?: string}>(thenResult)).toBeTrue()
    if (isValidElement<{className?: string}>(thenResult)) {
      expect(thenResult.props.className).toBe('branch')
    }
    const elseResult = branch({
      if: false,
      className: 'branch',
      else: Fallback,
    })
    expect(isValidElement<{className?: string}>(elseResult)).toBeTrue()
    if (isValidElement<{className?: string}>(elseResult)) {
      expect(elseResult.props.className).toBe('branch')
    }
  })
  test('merges className after an explicit className on instantiated outputs', () => {
    const thenResult = branch({
      if: true,
      className: 'branch',
      then: createElement('div', {className: 'own'}),
    })
    expect(isValidElement<{className?: string}>(thenResult)).toBeTrue()
    if (isValidElement<{className?: string}>(thenResult)) {
      expect(thenResult.props.className).toBe('own branch')
    }
    const elseResult = branch({
      if: false,
      className: 'branch',
      else: createElement('div', {className: 'fallback'}),
    })
    expect(isValidElement<{className?: string}>(elseResult)).toBeTrue()
    if (isValidElement<{className?: string}>(elseResult)) {
      expect(elseResult.props.className).toBe('fallback branch')
    }
  })
  test('passes and merges className into children', () => {
    const result = branch({
      if: true,
      className: 'branch',
      children: [
        createElement('div', {
          className: 'first',
          key: 'first',
        }),
        createElement('span', {key: 'second'}),
        'text',
      ],
    })
    expect(Array.isArray(result)).toBeTrue()
    if (Array.isArray(result)) {
      const children = result as Array<ReactNode>
      expect(isValidElement<{className?: string}>(children[0])).toBeTrue()
      expect(isValidElement<{className?: string}>(children[1])).toBeTrue()
      if (isValidElement<{className?: string}>(children[0]) && isValidElement<{className?: string}>(children[1])) {
        expect(children[0].props.className).toBe('first branch')
        expect(children[1].props.className).toBe('branch')
      }
      expect(children[2]).toBe('text')
    }
  })
  test('passes className through fragments', () => {
    const result = branch({
      if: true,
      className: 'branch',
      children: createElement(Fragment, null, createElement('div', {className: 'own'}), createElement('span')),
    })
    expect(isValidElement<{children?: Array<unknown>}>(result)).toBeTrue()
    if (isValidElement<{children?: Array<unknown>}>(result)) {
      const children = result.props.children
      expect(Array.isArray(children)).toBeTrue()
      if (Array.isArray(children)) {
        expect(isValidElement<{className?: string}>(children[0])).toBeTrue()
        expect(isValidElement<{className?: string}>(children[1])).toBeTrue()
        if (isValidElement<{className?: string}>(children[0]) && isValidElement<{className?: string}>(children[1])) {
          expect(children[0].props.className).toBe('own branch')
          expect(children[1].props.className).toBe('branch')
        }
      }
    }
  })
  test('applies className to then and children when both are rendered', () => {
    const result = branch({
      if: true,
      className: 'branch',
      then: createElement('header', {className: 'header'}),
      children: createElement('main', {className: 'content'}),
    })
    expect(isValidElement<{children: Array<unknown>}>(result)).toBeTrue()
    if (isValidElement<{children: Array<unknown>}>(result)) {
      const [thenOutput, childrenOutput] = result.props.children
      expect(isValidElement<{className?: string}>(thenOutput)).toBeTrue()
      expect(isValidElement<{className?: string}>(childrenOutput)).toBeTrue()
      if (isValidElement<{className?: string}>(thenOutput) && isValidElement<{className?: string}>(childrenOutput)) {
        expect(thenOutput.props.className).toBe('header branch')
        expect(childrenOutput.props.className).toBe('content branch')
      }
    }
  })
  test('leaves non-element children unchanged', () => {
    expect(branch({
      if: true,
      className: 'branch',
      children: 'text',
    })).toBe('text')
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
  test('defers a lazy else function until React renders the failed branch', () => {
    let calls = 0
    const lazy = () => {
      calls++
      return 'lazy fallback'
    }
    const ignored = branch({
      if: true,
      else: lazy,
      children: child,
    })
    expect(ignored).toBe(child)
    expect(calls).toBe(0)
    const result = branch({
      if: false,
      else: lazy,
      children: child,
    })
    expect(calls).toBe(0)
    expect(isValidElement(result)).toBeTrue()
    if (isValidElement(result) && typeof result.type === 'function') {
      expect((result.type as () => unknown)()).toBe('lazy fallback')
      expect(calls).toBe(1)
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
