import React from 'react';
import ThemeContext from './ThemeContext';
import sizes from './Sizes';
import colors from './Colors';
import fonts from './Fonts';

const ThemeProvider = ({ children, ...props }) => (
  <ThemeContext.Provider
    value={{
      fonts: { ...props.fonts },
      colors: { ...props.colors },
      sizes: { ...props.sizes },
      CONFIG: props.CONFIG || {},
      ...props,
    }}
  >
    {children}
  </ThemeContext.Provider>
);

ThemeProvider.defaultProps = {
  fonts,
  colors,
  sizes,
};

export default ThemeProvider;
