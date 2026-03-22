export const tokens = {
  colors: {
    // Premium gradients
    gradientFrom: '#3b82f6',
    gradientTo: '#8b5cf6',
    gradientSuccess: '#10b981',
    gradientWarning: '#f59e0b',
    
    // Semantic colors
    success: '#16a34a',
    successLight: '#dcfce7',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    destructive: '#dc2626',
    destructiveLight: '#fecaca',
    
    // Surface colors
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    surfaceOverlay: 'rgba(0, 0, 0, 0.6)',
    surfaceHover: 'rgba(0, 0, 0, 0.04)',
    
    // Interactive states
    primaryHover: 'rgba(59, 130, 246, 0.9)',
    primaryPressed: 'rgba(59, 130, 246, 0.95)',
  },
  
  typography: {
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    
    // Hebrew-optimized sizes
    sizes: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
    },
    
    // Line heights optimized for Hebrew
    leading: {
      tight: '1.35',
      normal: '1.5',
      relaxed: '1.65',
    },
    
    // Letter spacing for Hebrew
    tracking: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
    }
  },
  
  spacing: {
    // 4px base scale optimized for mobile
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },
  
  radii: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.1)',
    base: '0 1px 3px 0 rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)',
    md: '0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.1)',
    lg: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.1)',
    xl: '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(16, 24, 40, 0.05)',
  },
  
  motion: {
    // Easing curves
    easing: {
      linear: 'linear',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    
    // Durations
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    
    // Presets for common animations
    presets: {
      fadeIn: 'opacity 250ms cubic-bezier(0, 0, 0.2, 1)',
      slideUp: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      scale: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      press: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  // Mobile-specific tokens
  mobile: {
    // Safe areas and touch targets
    touchTarget: '44px',
    safeArea: '16px',
    bottomSafe: '20px',
    
    // Breakpoints
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
    }
  }
};

export type Tokens = typeof tokens;
export const motion = tokens.motion;
export const spacing = tokens.spacing;
export const radii = tokens.radii;
