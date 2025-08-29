# UI/UX Notes

This document captures final UI/UX guidance for the Amit Gardens scheduling app.

## Accessibility

- Calendar grid uses semantic roles (`grid`, `gridcell`, `columnheader`).
- Day editor dialog traps focus and exposes ARIA labels.
- Animations respect `prefers-reduced-motion`.

## RTL & i18n

- Direction and language toggles are available in the toolbar.
- Layout and components rely on logical CSS properties for bidirectional support.

## Testing

- `MonthGrid` includes keyboard navigation with unit tests (`npm test`).

## Screenshots

_(Add final screenshots of the login and calendar screens here.)_
