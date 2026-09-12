import type {AtLeastOne} from '#src/lib/types/AtLeastOne.ts'
import type {ComponentType, ReactNode} from 'react'

import {createElement, Fragment} from 'react'

export type BranchProps = {
  children?: ReactNode
  else?: BranchOutput
  then?: BranchOutput
} & AtLeastOne<BranchConditions>

type BranchConditions = {
  all?: ReadonlyArray<unknown>
  if?: unknown
  none?: ReadonlyArray<unknown>
  not?: unknown
  some?: ReadonlyArray<unknown>
}

type LazyBranchOutput = () => ReactNode
type BranchOutput = ComponentType | LazyBranchOutput | ReactNode

const renderOutput = (output: BranchOutput | undefined): ReactNode => {
  if (typeof output === 'function') {
    return createElement(output)
  }
  return output ?? null
}
const Branch = (props: BranchProps): ReactNode => {
  const failed = Boolean('if' in props && !props.if
      || 'not' in props && props.not
      || 'some' in props && !props.some?.some(Boolean)
      || 'none' in props && props.none?.some(Boolean)
      || 'all' in props && !props.all?.every(Boolean))
  if (failed) {
    return renderOutput(props.else)
  }
  if ('then' in props) {
    const thenOutput = renderOutput(props.then)
    if ('children' in props) {
      return createElement(Fragment, null, thenOutput, props.children)
    }
    return thenOutput
  }
  return props.children
}

export default Branch
