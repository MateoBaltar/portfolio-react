import { useLanguage } from '../i18n/LanguageContext';

export function Taskbar({ navItems, openWindowIds, activeId, onNavClick }) {
  const { lang, setLang } = useLanguage();

  return (
    <nav className="taskbar">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className="taskbar__item"
          data-testid={`nav-${item.id}`}
          data-open={openWindowIds.includes(item.id)}
          aria-pressed={activeId === item.id}
          onClick={() => onNavClick(item.id)}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        className="taskbar__lang"
        data-testid="lang-toggle"
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      >
        {lang === 'en' ? 'ES' : 'EN'}
      </button>
    </nav>
  );
}

export default Taskbar;
