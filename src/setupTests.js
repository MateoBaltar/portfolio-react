import '@testing-library/jest-dom';

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // localStorage may throw SecurityError if blocked by browser/sandbox/privacy settings
  }

  // Reasonable shared default so individual test files don't each need their
  // own ad-hoc window.matchMedia stub. Test files that need fine-grained
  // control (e.g. useViewportMode.test.js) reassign window.matchMedia
  // themselves within the test body, which runs after this and still takes
  // precedence.
  window.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});
