import { useLanguage } from '../i18n/LanguageContext';

export function Projects() {
  const { t } = useLanguage();
  const projects = t('projects');

  return (
    <section className="section">
      <h2>{projects.title}</h2>
      {projects.items.map((project) => (
        <article className="projects__item" key={project.title}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <ul className="skills__list">
            {project.tools.map((tool) => (
              <li className="skills__list-item" key={tool}>
                {tool}
              </li>
            ))}
          </ul>
          <div className="projects__links">
            <a className="projects__link" href={project.liveDemoLink} target="_blank" rel="noreferrer">
              {projects.liveDemoLabel}
            </a>
            <a className="projects__link" href={project.codeLink} target="_blank" rel="noreferrer">
              {projects.codeLabel}
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
