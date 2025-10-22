export const spacing = {
  // Basic spacing scale
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64, // 64px

  // Component-specific spacing
  component: {
    buttonHeight: 48,      // Standard button height
    buttonHeightLarge: 56, // Large button height
    inputHeight: 48,       // Input field height
    cardPadding: 16,       // Card internal padding
    screenPadding: 20,     // Screen edge padding
    sectionSpacing: 32,    // Between major sections
    listItemHeight: 60,    // Standard list item height
    headerHeight: 88,      // Header/navigation height
    tabBarHeight: 83,      // Bottom tab bar height
  },

  // Touch targets (following iOS Human Interface Guidelines)
  touch: {
    minimum: 44,           // Minimum touch target size
    comfortable: 48,       // Comfortable touch target
    large: 56,            // Large touch target
  },

  // Layout containers
  container: {
    maxWidth: 420,        // Maximum content width
    padding: 20,          // Container padding
    marginHorizontal: 16, // Horizontal margins
    marginVertical: 8,    // Vertical margins
  },

  // Grid and layout
  grid: {
    gutter: 16,           // Grid gutter size
    margin: 20,           // Grid margin
    columnGap: 12,        // Gap between grid columns
    rowGap: 16,           // Gap between grid rows
  },

  // Border radius
  radius: {
    xs: 4,               // Small radius
    sm: 8,               // Small-medium radius
    md: 12,              // Medium radius
    lg: 16,              // Large radius
    xl: 24,              // Extra large radius
    full: 9999,          // Fully rounded
  },

  // Shadows and elevation
  shadow: {
    small: 2,            // Small shadow offset
    medium: 4,           // Medium shadow offset
    large: 8,            // Large shadow offset
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type ComponentSpacingKey = keyof typeof spacing.component;
export type TouchSpacingKey = keyof typeof spacing.touch;
export type ContainerSpacingKey = keyof typeof spacing.container;
export type GridSpacingKey = keyof typeof spacing.grid;
export type RadiusKey = keyof typeof spacing.radius;