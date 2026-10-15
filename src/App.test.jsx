import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  window.matchMedia = () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  render(<App />);
});
