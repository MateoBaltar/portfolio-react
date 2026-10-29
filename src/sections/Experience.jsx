import { useLanguage } from '../i18n/LanguageContext';

export function Experience() {
  const { t, lang } = useLanguage();
  const experience = t('experience');

  return (
    <section className="section">
      <h2>{experience.title}</h2>

      <h3>{experience.jobsTitle}</h3>
      {experience.jobs.map((job) => (
        <article className="experience__job" key={`${job.company}-${job.dates}`}>
          <h4>{job.role}</h4>
          <p className="experience__meta">
            {job.company} &middot; {job.location} &middot; {job.dates}
          </p>
          <p>{job.description}</p>
        </article>
      ))}

      <article className="experience__job">
        <h4>{experience.internship.role}</h4>
        <p className="experience__meta">
          {experience.internship.company} &middot; {experience.internship.location}
        </p>
        <p>{experience.internship.description}</p>
      </article>

      <h3>{experience.educationTitle}</h3>
      <article className="experience__job">
        <h4>{experience.education.program}</h4>
        <p className="experience__meta">
          {experience.education.institution} &middot; {experience.education.dates}
        </p>
        <p>{experience.education.description}</p>
      </article>

      <h3>{experience.certificationsTitle}</h3>
      <ul className="plain-list">
        {experience.certifications.map((certification) => (
          <li key={certification}>{certification}</li>
        ))}
      </ul>

      <h3>{experience.languagesTitle}</h3>
      <ul className="plain-list">
        {experience.languages.map((language) => (
          <li key={language.name}>
            {language.name}: {language.level}
          </li>
        ))}
      </ul>

      <a className="experience__cv-link" href={`/curriculum-${lang}.pdf`}>
        {experience.downloadCv}
      </a>
    </section>
  );
}
