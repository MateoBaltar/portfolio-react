import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPrompt } from './CommandPrompt';

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
