# branch-component

A tiny React component for readable conditional rendering.

## Install

```sh
npm install branch-component
```

## Usage

```tsx
import Branch from 'branch-component'

<Branch if={isVisible}>{child}</Branch>
```

`if` renders children when its value is truthy. `not` renders children when its value is falsy.

```tsx
<Branch not={isLoading}>{child}</Branch>
```

For several conditions, use `some`, `none`, or `all`.

```tsx
<Branch some={[isAdmin, isOwner]}>{controls}</Branch>
<Branch none={[isLoading, hasError]}>{content}</Branch>
<Branch all={[isAuthenticated, isAuthorized]}>{secret}</Branch>
```

The collection props use normal JavaScript truthiness. Empty arrays follow `Array.prototype.some` / `Array.prototype.every` semantics: `some={[]}` does not render, while `none={[]}` and `all={[]}` do.

Condition props can be combined freely. Every provided condition must pass, so different modes compose as a logical AND.

```tsx
<Branch if={isAuthenticated} not={isBanned}>{account}</Branch>
<Branch if={isVisible} some={[isAdmin, isOwner]} none={[isLoading, hasError]}>
  {content}
</Branch>
```

At least one condition prop is required in TypeScript.

## className

Use `className` to forward a class to the top-level elements of whichever branch renders. Existing class names are preserved, with the Branch class appended after them.

```tsx
<Branch if={isVisible} className={css.visible}>
  <Content className={css.content} />
</Branch>
```

This is equivalent to:

```tsx
<Content className={`${css.content} ${css.visible}`} />
```

The same behavior applies to `then` and `else`. Bare components receive `className` as a prop. Fragments and arrays forward it to each top-level element, while non-element nodes such as text are left unchanged.

## Else

Use `else` to render a fallback when any condition fails. It can be any React child, an uninstantiated component, or a lazy function. Functions are converted to React elements, so they are only invoked if React actually renders the failed branch.

```tsx
<Branch if={isVisible} else={<Hidden />}>{visible}</Branch>
<Branch if={isVisible} else={Hidden}>{visible}</Branch>
<Branch if={isVisible} else={() => expensiveFallback()}>{visible}</Branch>
```

## Then

Use `then` for the successful branch. Like `else`, it can be a React node, an uninstantiated component, or a lazy function. Functions are converted to React elements, so they are only invoked if React actually renders the successful branch.

```tsx
<Branch if={isVisible} then={<Visible />} />
<Branch if={isVisible} then={Visible} />
<Branch if={isVisible} then={Visible} else={Hidden} />
<Branch if={isVisible} then={() => expensiveContent()} />
```

When both `then` and JSX children are supplied, both are rendered in a fragment with `then` first.

```tsx
<Branch if={isVisible} then={<Header />}>
  <Content />
</Branch>
```
