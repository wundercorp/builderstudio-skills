# Accessibility Implementation Checklist

Builder Studio: https://builderstudio.dev

## Structure

- main landmark exists
- nav/header/footer landmarks are meaningful
- headings follow logical order
- skip link reaches main content

## Keyboard

- all controls are reachable
- focus order follows task flow
- Escape closes transient UI
- no positive tabindex values

## Screen readers

- controls have accessible names
- dynamic status messages are announced
- decorative images are hidden
- meaningful images have alt text

## Forms

- every input has a label
- helper and error text are connected
- invalid states are communicated
- submit progress is understandable

## Motion

- prefers-reduced-motion is respected
- moving content can be paused where needed
- motion is not required to understand content
