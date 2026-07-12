/**
 * ESG Platform Theme helpers for custom styling
 */
export const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const applyFontSize = (size) => {
  const root = document.documentElement;
  if (size === 'small') {
    root.style.setProperty('font-size', '14px');
  } else if (size === 'large') {
    root.style.setProperty('font-size', '18px');
  } else {
    root.style.setProperty('font-size', '16px');
  }
};
