import { useLanguage } from '../i18n/LanguageContext';

export function Experience() {
  const { t } = useLanguage();
  const experience = t('experience');

  return (
    <section>
      <h2>{experience.title}</h2>

      <h3>{experience.jobsTitle}</h3>
      {experience.jobs.map((job) => (
        <article key={`${job.company}-${job.dates}`}>
          <h4>{job.role}</h4>
          <p>
            {job.company} &middot; {job.location} &middot; {job.dates}
          </p>
          <p>{job.description}</p>
        </article>
      ))}

      <article>
        <h4>{experience.internship.role}</h4>
        <p>
          {experience.internship.company} &middot; {experience.internship.location}
        </p>
        <p>{experience.internship.description}</p>
      </article>

      <h3>{experience.educationTitle}</h3>
      <article>
        <h4>{experience.education.program}</h4>
        <p>
          {experience.education.institution} &middot; {experience.education.dates}
        </p>
        <p>{experience.education.description}</p>
      </article>

      <h3>{experience.certificationsTitle}</h3>
      <ul>
        {experience.certifications.map((certification) => (
          <li key={certification}>{certification}</li>
        ))}
      </ul>

      <h3>{experience.languagesTitle}</h3>
      <ul>
        {experience.languages.map((language) => (
          <li key={language.name}>
            {language.name}: {language.level}
          </li>
        ))}
      </ul>

      <a href="/curriculum.pdf">{experience.downloadCv}</a>
    </section>
  );
}
