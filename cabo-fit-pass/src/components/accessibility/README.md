# Accessibility Components and Guidelines

This directory contains comprehensive accessibility components and utilities for CaboFitPass, ensuring WCAG 2.1 AA compliance and an inclusive user experience.

## Components Overview

### Core Accessibility Components

1. **Focus Trap** (`focus-trap.tsx`)
   - Manages keyboard focus within modals, sheets, and dropdowns
   - Prevents focus from escaping interactive elements
   - Restores focus to previously focused element when closed

2. **Live Region** (`live-region.tsx`)
   - Provides screen reader announcements for dynamic content
   - Context-based announcement system
   - Specialized announcers for forms, navigation, and loading states

3. **Keyboard Navigation** (`keyboard-navigation.tsx`)
   - Arrow key navigation for menus, grids, and lists
   - Proper ARIA roles and states management
   - Support for horizontal, vertical, and grid navigation patterns

### Enhanced UI Components

4. **Accessible Button** (`/ui/accessible-button.tsx`)
   - Touch-optimized button with proper ARIA states
   - Built-in loading states and confirmation dialogs
   - Automatic screen reader announcements

5. **Accessible Input** (`/ui/accessible-input.tsx`)
   - Properly associated labels and error messages
   - Built-in validation state management
   - Specialized variants for email, password, phone, and search

6. **Accessible Card** (`/ui/accessible-card.tsx`)
   - Interactive cards with keyboard navigation
   - Proper ARIA roles and focus management
   - Specialized variants for classes and studios

### Utility Functions

7. **Accessibility Utils** (`/lib/utils/accessibility.ts`)
   - ARIA attribute helpers
   - Touch target size constants
   - Color contrast utilities
   - Focus management hooks
   - Reduced motion and high contrast detection

## Usage Examples

### Basic Focus Trap
```tsx
import { FocusTrap } from '@/components/accessibility/focus-trap'

<FocusTrap isActive={modalOpen}>
  <div>Modal content with trapped focus</div>
</FocusTrap>
```

### Live Region Announcements
```tsx
import { useLiveRegion } from '@/components/accessibility/live-region'

const { announce, announceSuccess, announceError } = useLiveRegion()

// Announce status changes
announce('Loading data...')
announceSuccess('Data loaded successfully')
announceError('Failed to load data')
```

### Keyboard Navigation
```tsx
import { MenuNavigation } from '@/components/accessibility/keyboard-navigation'

<MenuNavigation onSelect={(index) => handleSelect(index)}>
  <MenuItem>Item 1</MenuItem>
  <MenuItem>Item 2</MenuItem>
  <MenuItem>Item 3</MenuItem>
</MenuNavigation>
```

### Accessible Button
```tsx
import { AccessibleButton } from '@/components/ui/accessible-button'

<AccessibleButton
  loading={isLoading}
  loadingText="Booking class..."
  successMessage="Class booked successfully!"
  announcement="Booking class"
  confirmAction={true}
  confirmText="Book this class for 5 credits?"
>
  Book Class
</AccessibleButton>
```

### Accessible Input
```tsx
import { AccessibleInput } from '@/components/ui/accessible-input'

<AccessibleInput
  label="Email Address"
  type="email"
  required={true}
  error={errors.email}
  description="We'll never share your email address"
/>
```

## Accessibility Features

### WCAG 2.1 AA Compliance

✅ **Keyboard Navigation**
- All interactive elements accessible via keyboard
- Visible focus indicators
- Logical tab order
- Skip navigation links

✅ **Screen Reader Support**
- Proper ARIA labels and roles
- Live regions for dynamic content
- Descriptive alt text for images
- Semantic HTML structure

✅ **Touch Accessibility**
- Minimum 44px touch targets
- Touch-optimized spacing
- Gesture alternatives for complex interactions

✅ **Visual Accessibility**
- High contrast color combinations
- Scalable text and UI elements
- Reduced motion support
- Clear visual hierarchy

✅ **Cognitive Accessibility**
- Clear and consistent navigation
- Error prevention and recovery
- Contextual help and instructions
- Progress indicators for multi-step processes

### Mobile Accessibility

- **Touch Targets**: All interactive elements meet minimum 44px touch target size
- **Gesture Support**: Alternative methods for complex gestures
- **Orientation Support**: Works in both portrait and landscape modes
- **Zoom Support**: Interface remains functional at up to 200% zoom

### Navigation Accessibility

- **Skip Links**: Quick navigation to main content areas
- **Landmark Roles**: Proper page structure with header, nav, main, aside, footer
- **Breadcrumbs**: Clear navigation path indication
- **Focus Management**: Logical focus order and restoration

### Form Accessibility

- **Label Association**: All form controls have associated labels
- **Error Handling**: Clear error messages with ARIA live regions
- **Required Fields**: Properly marked with visual and programmatic indicators
- **Input Validation**: Real-time feedback with accessible error states

### Content Accessibility

- **Headings**: Proper heading hierarchy (h1-h6)
- **Lists**: Semantic markup for grouped content
- **Tables**: Proper header associations for data tables
- **Images**: Descriptive alt text for informative images

## Testing Guidelines

### Automated Testing
- Use axe-core for automated accessibility testing
- Include accessibility tests in CI/CD pipeline
- Regular lighthouse accessibility audits

### Manual Testing
- Keyboard-only navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- High contrast mode testing
- Reduced motion preference testing

### User Testing
- Include users with disabilities in testing process
- Test with actual assistive technologies
- Gather feedback on real-world usage

## Implementation Checklist

### For New Components
- [ ] Proper ARIA roles and properties
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Screen reader announcements
- [ ] Touch-optimized sizing
- [ ] High contrast support
- [ ] Reduced motion consideration

### For Existing Components
- [ ] Add ARIA labels where missing
- [ ] Implement keyboard navigation
- [ ] Add focus management
- [ ] Include screen reader support
- [ ] Optimize touch targets
- [ ] Test with assistive technologies

## Resources

### Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA (Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS)](https://www.apple.com/accessibility/mac/vision/)
- [TalkBack (Android)](https://support.google.com/accessibility/android/answer/6283677)

## Contributing

When adding new accessibility features:
1. Follow existing patterns and conventions
2. Include comprehensive documentation
3. Add appropriate TypeScript types
4. Include usage examples
5. Test with actual assistive technologies
6. Update this documentation

## Support

For accessibility-related questions or issues:
- Review the WCAG guidelines
- Check existing component implementations
- Test with screen readers
- Consult accessibility experts when needed

Remember: Accessibility is not a feature to be added later—it should be built in from the start of every component and feature.