import { useLanguage } from '../i18n/LanguageContext';

export function Skills() {
  const { t } = useLanguage();
  const skills = t('skills');

  return (
    <section>
      <h2>{skills.title}</h2>
      {skills.categories.map((category) => (
        <div key={category.label}>
          <h3>{category.label}</h3>
          <ul>
            {category.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
