import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';
import { GitHubStats } from './GitHubStats';

function renderWithLang() {
  return render(
    <LanguageProvider initialLang="en">
      <GitHubStats />
    </LanguageProvider>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('shows stats and the contribution chart once the fetch succeeds', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ public_repos: 12, followers: 3 }),
    })
  );
  renderWithLang();
  expect(await screen.findByAltText(/contribution graph/i)).toBeInTheDocument();
  expect(screen.getByText(/12/)).toBeInTheDocument();
  expect(screen.getByText(/3/)).toBeInTheDocument();
});

test('shows a fallback message and a direct link when the fetch fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rate limited')));
  renderWithLang();
  expect(await screen.findByText(/Couldn't load GitHub stats/i)).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/MateoBaltar');
});

test('shows a fallback message when the response is not ok', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status: 403, json: () => Promise.resolve({}) })
  );
  renderWithLang();
  expect(await screen.findByText(/Couldn't load GitHub stats/i)).toBeInTheDocument();
});
