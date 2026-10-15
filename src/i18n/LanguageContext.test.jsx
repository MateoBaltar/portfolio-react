import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

function Probe() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="value">{String(t('greeting'))}</span>
      <button onClick={() => setLang('es')}>es</button>
    </div>
  );
}

test('resolves nested keys for the active language and falls back to the key when missing', () => {
  render(
    <LanguageProvider initialDictionaries={{ en: { greeting: 'hi' }, es: { greeting: 'hola' } }}>
      <Probe />
    </LanguageProvider>
  );
  expect(screen.getByTestId('value').textContent).toBe('hi');
  fireEvent.click(screen.getByText('es'));
  expect(screen.getByTestId('lang').textContent).toBe('es');
  expect(screen.getByTestId('value').textContent).toBe('hola');
});

test('returns the key itself when the path is missing from the dictionary', () => {
  render(
    <LanguageProvider initialDictionaries={{ en: {}, es: {} }}>
      <Probe />
    </LanguageProvider>
  );
  expect(screen.getByTestId('value').textContent).toBe('greeting');
});
