import { useLanguage } from '../i18n/LanguageContext';

export function Skills() {
  const { t } = useLanguage();
  const skills = t('skills');

  return (
    <section className="section">
      <h2>{skills.title}</h2>
      {skills.categories.map((category) => (
        <div key={category.label}>
          <h3>{category.label}</h3>
          <ul className="skills__list">
            {category.items.map((item) => (
              <li className="skills__list-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
