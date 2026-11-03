import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPrompt } from './CommandPrompt';
import { playKey } from './sound';

vi.mock('./sound', () => ({
  playClick: vi.fn(),
  playKey: vi.fn(),
  isMuted: vi.fn(() => false),
  toggleMute: vi.fn(() => true),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('submitting a known command calls onCommand with its name and args', () => {
  const onCommand = vi.fn();
  render(<CommandPrompt commandNames={['about', 'lang']} onCommand={onCommand} notFoundMessage="command not found" helpIntro="Available commands:" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'lang es' } });
  fireEvent.submit(input.closest('form'));
  expect(onCommand).toHaveBeenCalledWith('lang', ['es']);
});

test('submitting an unknown command shows the not-found message and does not call onCommand', () => {
  const onCommand = vi.fn();
  render(<CommandPrompt commandNames={['about']} onCommand={onCommand} notFoundMessage="command not found" helpIntro="Available commands:" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'abuot' } });
  fireEvent.submit(input.closest('form'));
  expect(screen.getByText('command not found')).toBeInTheDocument();
  expect(onCommand).not.toHaveBeenCalled();
});

test('help lists every command name without calling onCommand', () => {
  const onCommand = vi.fn();
  render(<CommandPrompt commandNames={['about', 'skills']} onCommand={onCommand} notFoundMessage="command not found" helpIntro="Available commands:" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'help' } });
  fireEvent.submit(input.closest('form'));
  expect(screen.getByText('Available commands:')).toBeInTheDocument();
  expect(screen.getByText(/about/)).toBeInTheDocument();
  expect(screen.getByText(/skills/)).toBeInTheDocument();
  expect(onCommand).not.toHaveBeenCalled();
});

test('a command listed in extraCommands prints its own output instead of calling onCommand', () => {
  const onCommand = vi.fn();
  const fetchOutput = vi.fn(() => ['line one', 'line two']);
  render(
    <CommandPrompt
      commandNames={['fetch']}
      onCommand={onCommand}
      notFoundMessage="command not found"
      helpIntro="Available commands:"
      extraCommands={{ fetch: fetchOutput }}
    />
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'fetch' } });
  fireEvent.submit(input.closest('form'));
  expect(screen.getByText('line one')).toBeInTheDocument();
  expect(screen.getByText('line two')).toBeInTheDocument();
  expect(onCommand).not.toHaveBeenCalled();
});

test('an easter egg command prints its joke response and is not listed in help', () => {
  const onCommand = vi.fn();
  render(
    <CommandPrompt
      commandNames={['about']}
      onCommand={onCommand}
      notFoundMessage="command not found"
      helpIntro="Available commands:"
      easterEggs={{ sudo: "nice try, you're not root here." }}
    />
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'sudo' } });
  fireEvent.submit(input.closest('form'));
  expect(screen.getByText("nice try, you're not root here.")).toBeInTheDocument();
  expect(onCommand).not.toHaveBeenCalled();

  fireEvent.change(input, { target: { value: 'help' } });
  fireEvent.submit(input.closest('form'));
  // sudo was already echoed once; help shouldn't add a second copy
  expect(screen.getAllByText('sudo')).toHaveLength(1);
  expect(screen.getByText('about')).toBeInTheDocument();
});

test('typing in the input plays a key sound per keystroke', () => {
  const onCommand = vi.fn();
  render(<CommandPrompt commandNames={['about']} onCommand={onCommand} notFoundMessage="command not found" helpIntro="Available commands:" />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'a' } });
  fireEvent.change(input, { target: { value: 'ab' } });
  expect(playKey).toHaveBeenCalledTimes(2);
});
