import { useState, useEffect } from 'react';

export function useViewportMode(breakpointPx = 768) {
  const [mode, setMode] = useState(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    return mql.matches ? 'desktop' : 'mobile';
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);

    const handleChange = (event) => {
      setMode(event.matches ? 'desktop' : 'mobile');
    };

    mql.addEventListener('change', handleChange);

    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, [breakpointPx]);

  return mode;
}
