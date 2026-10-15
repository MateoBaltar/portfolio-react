import { useLanguage } from '../i18n/LanguageContext';

export function About() {
  const { t } = useLanguage();
  const about = t('about');

  return (
    <section className="section">
      <h2>{about.title}</h2>
      <p>{about.summary}</p>
    </section>
  );
}
