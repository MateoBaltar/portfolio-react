import { useLanguage } from '../i18n/LanguageContext';

export function Projects() {
  const { t } = useLanguage();
  const projects = t('projects');

  return (
    <section>
      <h2>{projects.title}</h2>
      {projects.items.map((project) => (
        <article key={project.title}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <ul>
            {project.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          <a href={project.liveDemoLink} target="_blank" rel="noreferrer">
            {projects.liveDemoLabel}
          </a>
          <a href={project.codeLink} target="_blank" rel="noreferrer">
            {projects.codeLabel}
          </a>
        </article>
      ))}
    </section>
  );
}
