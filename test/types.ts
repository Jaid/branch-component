/* eslint-disable unicorn/no-thenable */
import type {BranchProps} from '#src/main.ts'

import branch from '#src/main.ts'

const Fallback = () => null
const Success = () => null
const valid: Array<BranchProps> = [
  {if: true},
  {condition: true},
  {unless: false},
  {not: false},
  {some: [true, false]},
  {none: [false, false]},
  {all: [true, true]},
  {
    if: false,
    else: 'fallback',
  },
  {
    if: false,
    else: Fallback,
  },
  {
    if: true,
    then: 'success',
  },
  {
    if: true,
    then: Success,
    else: Fallback,
  },
  {
    if: true,
    then: 'then',
    children: 'children',
  },
  {
    if: true,
    not: false,
  },
  {
    if: true,
    condition: true,
    unless: false,
    not: false,
  },
  {
    if: true,
    some: [true],
    none: [false],
    all: [true],
  },
]
void valid
void branch
// @ts-expect-error TS2322 At least one condition prop is required.
const missing: BranchProps = {else: 'fallback'}
// @ts-expect-error TS2322 Collection modes require readonly arrays.
const invalidCollection: BranchProps = {some: true}
void missing
void invalidCollection
