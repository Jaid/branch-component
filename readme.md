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

`if` and `condition` render children when their value is truthy. `unless` and `not` render children when their value is falsy.

```tsx
<Branch condition={isVisible}>{child}</Branch>
<Branch unless={isLoading}>{child}</Branch>
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


## Else

Use `else` to render a fallback when any condition fails. It can be any React child or a component. Component values are converted to elements automatically.

```tsx
<Branch if={isVisible} else={<Hidden />}>{visible}</Branch>
<Branch if={isVisible} else={Hidden}>{visible}</Branch>
```

## Then

Use `then` for the successful branch. Like `else`, it can be a React node or an uninstantiated component, which is converted to an element automatically.

```tsx
<Branch if={isVisible} then={<Visible />} />
<Branch if={isVisible} then={Visible} />
<Branch if={isVisible} then={Visible} else={Hidden} />
```

When both `then` and JSX children are supplied, both are rendered in a fragment with `then` first.

```tsx
<Branch if={isVisible} then={<Header />}>
  <Content />
</Branch>
```
