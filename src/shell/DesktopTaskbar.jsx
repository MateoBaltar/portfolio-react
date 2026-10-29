import { useEffect, useRef, useState } from 'react';
import fireOSMark from '../assets/fireos-mark.svg';
import { playClick, isMuted, toggleMute } from './sound';

const FIREOS_VERSION = 'v1.0';
const CLOCK_TICK_MS = 20000;

function SpeakerIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 9.5h3.2L11 6v12l-3.8-3.5H4Z"
        fill="currentColor"
      />
      {muted ? (
        <path
          d="M15.5 9.5l4.5 4.5M20 9.5l-4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M15.3 8.3a5 5 0 0 1 0 7.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function ClockWidget({ lang }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(now);
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(now);

  return (
    <div className="desktop-taskbar__clock" data-testid="taskbar-clock">
      <span className="desktop-taskbar__clock-time">{time}</span>
      <span className="desktop-taskbar__clock-date">{date}</span>
    </div>
  );
}

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
  const [muted, setMuted] = useState(() => isMuted());
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

  const handleMenuToggle = () => {
    playClick();
    setMenuOpen((open) => !open);
  };

  const handleMenuItemClick = (id) => {
    playClick();
    onOpen(id);
    setMenuOpen(false);
  };

  const handleTabClick = (id) => {
    playClick();
    onFocus(id);
  };

  const handleMuteToggle = () => {
    const next = toggleMute();
    setMuted(next);
    playClick();
  };

  return (
    <div className="desktop-taskbar">
      <div className="desktop-taskbar__menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="desktop-taskbar__menu-button"
          data-testid="desktop-menu-button"
          aria-expanded={menuOpen}
          aria-label={menuLabel}
          onClick={handleMenuToggle}
        >
          <img src={fireOSMark} alt="" className="desktop-taskbar__menu-icon" />
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
            onClick={() => handleTabClick(win.id)}
          >
            {win.label}
          </button>
        ))}
      </div>
      <div className="desktop-taskbar__tray">
        <button
          type="button"
          className="desktop-taskbar__tray-item desktop-taskbar__sound"
          data-testid="sound-toggle"
          aria-pressed={muted}
          aria-label={muted ? 'Unmute' : 'Mute'}
          onClick={handleMuteToggle}
        >
          <SpeakerIcon muted={muted} />
        </button>
        <ClockWidget lang={lang} />
        <button
          type="button"
          className="desktop-taskbar__tray-item desktop-taskbar__lang"
          data-testid="lang-toggle"
          onClick={() => {
            playClick();
            setLang(lang === 'en' ? 'es' : 'en');
          }}
        >
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
        <div className="desktop-taskbar__version" data-testid="taskbar-version">
          <img src={fireOSMark} alt="" className="desktop-taskbar__version-icon" />
          <span>FireOS {FIREOS_VERSION}</span>
        </div>
      </div>
    </div>
  );
}

export default DesktopTaskbar;
