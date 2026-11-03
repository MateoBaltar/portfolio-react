import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const GITHUB_USERNAME = 'MateoBaltar';
const FETCH_TIMEOUT_MS = 6000;

export function GitHubStats() {
  const { t } = useLanguage();
  const github = t('github');
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`GitHub API responded with ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStats({ repos: data.public_repos, followers: data.followers });
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="section">
      <h2>{github.title}</h2>

      {status === 'loading' && <p>{github.loading}</p>}

      {status === 'error' && (
        <p>
          {github.error}{' '}
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
            {github.visitLink}
          </a>
        </p>
      )}

      {status === 'ready' && stats && (
        <>
          <ul className="plain-list">
            <li>
              {github.reposLabel}: {stats.repos}
            </li>
            <li>
              {github.followersLabel}: {stats.followers}
            </li>
          </ul>
          <img
            className="github__chart"
            src={`https://ghchart.rshah.org/c084fc/${GITHUB_USERNAME}`}
            alt={github.chartAlt}
          />
          <p>
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
              {github.visitLink}
            </a>
          </p>
        </>
      )}
    </section>
  );
}

export default GitHubStats;
