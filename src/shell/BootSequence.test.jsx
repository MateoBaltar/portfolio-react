import { render, screen, act } from '@testing-library/react';
import { BootSequence } from './BootSequence';

test('prints each line in order then calls onComplete', async () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  render(<BootSequence lines={['one', 'two']} lineDelayMs={100} onComplete={onComplete} />);
  act(() => { vi.advanceTimersByTime(100); });
  expect(screen.getByText('one')).toBeInTheDocument();
  act(() => { vi.advanceTimersByTime(100); });
  expect(screen.getByText('two')).toBeInTheDocument();
  expect(onComplete).toHaveBeenCalled();
  vi.useRealTimers();
});
