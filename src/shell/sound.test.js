import { playClick, playKey, isMuted, toggleMute } from './sound';

function withLocalStorage() {
  const store = {};
  window.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
  };
  return store;
}

afterEach(() => {
  window.localStorage = undefined;
});

test('playClick and playKey do not throw when AudioContext is unavailable', () => {
  // This environment (jsdom) has no AudioContext/webkitAudioContext at all,
  // which is exactly the defensive case these must handle safely.
  expect(() => playClick()).not.toThrow();
  expect(() => playKey()).not.toThrow();
});

test('toggleMute flips the mute flag and persists it', () => {
  const store = withLocalStorage();
  const before = isMuted();
  const after = toggleMute();
  expect(after).toBe(!before);
  expect(isMuted()).toBe(after);
  expect(store['fireos-muted']).toBe(String(after));
});

test('toggling back returns to the original state', () => {
  withLocalStorage();
  const current = isMuted();
  const next = toggleMute();
  expect(next).toBe(!current);
  const backAgain = toggleMute();
  expect(backAgain).toBe(current);
});
