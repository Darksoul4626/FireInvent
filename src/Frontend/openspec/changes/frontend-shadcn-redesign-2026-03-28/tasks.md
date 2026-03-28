## 1. UI Foundation

- [x] 1.1 Add shadcn/ui setup and required frontend dependencies
- [x] 1.2 Establish global theme/token foundation for light and dark modes
- [x] 1.3 Introduce app-level theme provider and user-accessible theme switch

Done criteria:
- shadcn/ui components can be imported and used in app routes
- Light and dark themes apply globally with consistent tokens
- Theme switch is visible and persists user preference

## 2. App Shell and Navigation

- [x] 2.1 Replace current top-only navigation with app shell layout
- [x] 2.2 Implement permanent collapsible sidenav for desktop
- [x] 2.3 Implement responsive mobile drawer navigation with same nav items
- [x] 2.4 Ensure active-route highlighting and keyboard accessibility

Done criteria:
- Desktop users can collapse/expand sidenav persistently
- Mobile users can open/close drawer navigation
- Navigation remains usable via keyboard and screen reader labels

## 3. Page and Component Migration

- [x] 3.1 Migrate start page to shadcn-based content structure
- [x] 3.2 Migrate inventory list/detail/new/edit views to design system components
- [x] 3.3 Migrate rental list/new/edit views and lifecycle actions to design system components
- [x] 3.4 Align calendar page controls, legends, and table fallback with theme system

Done criteria:
- Core pages share consistent spacing, typography, and component behavior
- Existing `data-testid` selectors required by tests are preserved or compatibly mapped
- No functional API workflow regression in inventory/rental flows

## 4. Responsive and Accessibility Hardening

- [x] 4.1 Verify and refine layouts for mobile, tablet, and desktop breakpoints
- [x] 4.2 Improve dense data presentation via table overflow/fallback behavior (without compact mode)
- [x] 4.3 Validate color contrast in both themes for status and navigation states

Done criteria:
- Pages remain fully operable on mobile widths
- Dense datasets stay readable and navigable
- Contrast checks pass for primary UI states in both themes

Scope note:
- Kompaktmodus fuer Power-User (reduzierte Row-Hoehen/Abstaende) ist bewusst aus diesem Change ausgeschlossen und wird in einem Folge-Change geplant.

## 5. Quality Validation

- [x] 5.1 Update frontend unit tests affected by structural UI changes
- [x] 5.2 Update Playwright navigation assumptions if necessary
- [x] 5.3 Run and pass unit tests, e2e smoke flow, and frontend build

Done criteria:
- Test suites pass with updated but stable selectors
- Build succeeds without introducing frontend type or runtime regressions
- Critical flow item create -> rental create -> availability checks remains valid
