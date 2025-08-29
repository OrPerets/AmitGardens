export const tokens = {
  colors: {
    gradientFrom: '#3b82f6',
    gradientTo: '#8b5cf6',
    success: '#16a34a',
    warning: '#f59e0b',
    destructive: '#dc2626',
  },
  typography: {
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    body: '14px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  motion: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

export type Tokens = typeof tokens;
export const motion = tokens.motion;
