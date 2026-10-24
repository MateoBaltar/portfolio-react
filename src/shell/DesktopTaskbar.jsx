import { useEffect, useRef, useState } from 'react';

export function DesktopTaskbar({
  menuLabel,
  menuItems,
  openWindows,
  activeId,
  onOpen,
  onFocus,
  lang,
  setLang,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleMenuItemClick = (id) => {
    onOpen(id);
    setMenuOpen(false);
  };

  return (
    <div className="desktop-taskbar">
      <div className="desktop-taskbar__menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="desktop-taskbar__menu-button"
          data-testid="desktop-menu-button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuLabel}
        </button>
        {menuOpen && (
          <div className="desktop-taskbar__popup" data-testid="desktop-menu-popup">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="desktop-taskbar__popup-item"
                data-testid={`desktop-menu-item-${item.id}`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="desktop-taskbar__tabs">
        {openWindows.map((win) => (
          <button
            key={win.id}
            type="button"
            className="desktop-taskbar__tab"
            data-testid={`taskbar-tab-${win.id}`}
            aria-pressed={activeId === win.id}
            onClick={() => onFocus(win.id)}
          >
            {win.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="desktop-taskbar__lang"
        data-testid="lang-toggle"
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
      >
        {lang === 'en' ? 'ES' : 'EN'}
      </button>
    </div>
  );
}

export default DesktopTaskbar;
