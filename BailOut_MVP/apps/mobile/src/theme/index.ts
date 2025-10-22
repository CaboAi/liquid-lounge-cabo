export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';

export type {
  ColorKey,
  CallerTypeColor,
  CallStatusColor,
  SubscriptionColor
} from './colors';

export type {
  SpacingKey,
  ComponentSpacingKey,
  TouchSpacingKey,
  ContainerSpacingKey,
  GridSpacingKey,
  RadiusKey
} from './spacing';

export type {
  FontSizeKey,
  FontWeightKey,
  LineHeightKey,
  TextStyleKey
} from './typography';

// Combined theme object
export const theme = {
  colors: colors,
  spacing: spacing,
  typography: typography,
} as const;

export type Theme = typeof theme;