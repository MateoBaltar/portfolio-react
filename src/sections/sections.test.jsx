import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { About } from './About';
import { Contact } from './Contact';

function withLang(ui, lang) {
  return (
    <LanguageProvider key={lang} initialLang={lang}>
      {ui}
    </LanguageProvider>
  );
}

test('About renders the EN summary by default and the ES summary when lang is es', () => {
  const { rerender } = render(withLang(<About />, 'en'));
  expect(screen.getByText(/Backend-leaning full-stack developer/)).toBeInTheDocument();
  rerender(withLang(<About />, 'es'));
  expect(screen.getByText(/Desarrollador full-stack con inclinación backend/)).toBeInTheDocument();
});

test('Contact form posts to the formsubmit.co endpoint with the required fields', () => {
  render(withLang(<Contact />, 'en'));
  const form = screen.getByTestId('contact-form');
  expect(form.getAttribute('action')).toBe('https://formsubmit.co/mateobaltar@gmail.com');
  expect(screen.getByPlaceholderText('Name')).toBeRequired();
  expect(screen.getByPlaceholderText('Email')).toBeRequired();
  expect(screen.getByPlaceholderText('Message')).toBeRequired();
});
