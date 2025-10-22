export const typography = {
  // Font families
  fontFamily: {
    primary: 'System',      // iOS system font (San Francisco)
    mono: 'Menlo',          // Monospace font
  },

  // Font sizes (following iOS Human Interface Guidelines)
  fontSize: {
    // Display sizes
    display: 34,           // Large display text
    title1: 28,            // Page titles
    title2: 22,            // Section titles
    title3: 20,            // Subsection titles

    // Body text sizes
    headline: 17,          // Headlines
    body: 17,              // Body text
    bodySecondary: 15,     // Secondary body text
    callout: 16,           // Callout text

    // UI element sizes
    subhead: 15,           // Subheadings
    footnote: 13,          // Footnotes
    caption1: 12,          // Captions
    caption2: 11,          // Small captions

    // Custom sizes
    button: 17,            // Button text
    input: 17,             // Input field text
    tab: 10,               // Tab bar text
  },

  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,            // Tight line height
    normal: 1.4,           // Normal line height
    relaxed: 1.6,          // Relaxed line height
    loose: 1.8,            // Loose line height
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,           // Tight letter spacing
    normal: 0,             // Normal letter spacing
    wide: 0.5,             // Wide letter spacing
  },

  // Text styles (complete style objects)
  textStyles: {
    // Display styles
    displayLarge: {
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },

    // Title styles
    title1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 1.3,
      letterSpacing: -0.3,
    },
    title2: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 1.3,
      letterSpacing: -0.2,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.3,
    },

    // Body styles
    headline: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    bodySecondary: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.4,
    },

    // UI element styles
    button: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    buttonSmall: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 1.2,
    },
    input: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 1.2,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.3,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 1.3,
    },

    // Tab and navigation
    tab: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 1.2,
    },
    navigation: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 1.2,
    },
  },
} as const;

export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type LineHeightKey = keyof typeof typography.lineHeight;
export type TextStyleKey = keyof typeof typography.textStyles;