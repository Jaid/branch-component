import type {AtLeastOne} from '#src/lib/types/AtLeastOne.ts'
import type {ComponentType, ReactElement, ReactNode} from 'react'
import type {Arrayable} from 'type-fest'

import {cloneElement, createElement, Fragment, isValidElement} from 'react'

export type BranchProps = {
  children?: ReactNode
  className?: Arrayable<string | null | undefined>
  else?: BranchOutput
  then?: BranchOutput
} & AtLeastOne<BranchConditions>

type ClassNameProps = {className?: string}

type BranchConditions = {
  all?: ReadonlyArray<unknown>
  if?: unknown
  none?: ReadonlyArray<unknown>
  not?: unknown
  some?: ReadonlyArray<unknown>
}

type LazyBranchOutput = () => ReactNode
type BranchOutput = ComponentType | LazyBranchOutput | ReactNode

const notNullish = (value: string | null | undefined): value is string => value !== undefined && value !== null
const normalizeClassName = (className: Arrayable<string | null | undefined> | undefined): string | undefined => {
  const classNames = (Array.isArray(className) ? className : [className]).filter(notNullish)
  return classNames.length ? classNames.join(' ') : undefined
}
const mergeClassName = (existing: string | undefined, className: string): string => [existing, className].filter(Boolean).join(' ')
const applyClassName = (output: ReactNode, className: string | undefined): ReactNode => {
  if (className === undefined) {
    return output
  }
  if (Array.isArray(output)) {
    const children = output as Array<ReactNode>
    return children.map(child => applyClassName(child, className))
  }
  if (!isValidElement(output)) {
    return output
  }
  if (output.type === Fragment) {
    const fragment = output as ReactElement<{children?: ReactNode}>
    return cloneElement(fragment, undefined, applyClassName(fragment.props.children, className))
  }
  const element = output as ReactElement<ClassNameProps>
  return cloneElement(element, {className: mergeClassName(element.props.className, className)})
}
const renderOutput = (output: BranchOutput | undefined, className: string | undefined): ReactNode => {
  if (typeof output === 'function') {
    return createElement(output as ComponentType<ClassNameProps>, className === undefined ? undefined : {className})
  }
  return applyClassName(output ?? null, className)
}
const Branch = (props: BranchProps): ReactNode => {
  const className = normalizeClassName(props.className)
  const failed = Boolean('if' in props && !props.if
      || 'not' in props && props.not
      || 'some' in props && !props.some?.some(Boolean)
      || 'none' in props && props.none?.some(Boolean)
      || 'all' in props && !props.all?.every(Boolean))
  if (failed) {
    return renderOutput(props.else, className)
  }
  if ('then' in props) {
    const thenOutput = renderOutput(props.then, className)
    if ('children' in props) {
      return createElement(Fragment, null, thenOutput, applyClassName(props.children, className))
    }
    return thenOutput
  }
  return applyClassName(props.children, className)
}

export default Branch
