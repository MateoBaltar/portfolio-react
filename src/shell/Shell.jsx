import { useEffect, useMemo, useRef, useState } from 'react';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { WindowManagerProvider, useWindowManager } from '../windows/WindowManagerContext';
import { Window } from '../windows/Window';
import { useViewportMode } from '../hooks/useViewportMode';
import { BootSequence } from './BootSequence';
import { CommandPrompt } from './CommandPrompt';
import { Taskbar } from './Taskbar';
import { DesktopTaskbar } from './DesktopTaskbar';
import { Desktop } from './Desktop';
import { About } from '../sections/About';
import { Skills } from '../sections/Skills';
import { Experience } from '../sections/Experience';
import { Projects } from '../sections/Projects';
import { Contact } from '../sections/Contact';

const SECTIONS = {
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  contact: Contact,
};

const SECTION_IDS = Object.keys(SECTIONS);
// Desktop mode adds one more openable "app" beyond the five content
// sections: the terminal itself now lives inside its own window instead of
// being permanently docked, so it needs a place in the icon grid/start menu.
const DESKTOP_ITEM_IDS = [...SECTION_IDS, 'terminal'];

const LANG_CODES = ['en', 'es'];

function ShellBody() {
  const { lang, t, setLang } = useLanguage();
  const mode = useViewportMode();
  const { windows, openWindow, focusWindow } = useWindowManager();
  const [booted, setBooted] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  // last section opened, independent of viewport mode; doesn't trigger a re-render
  const lastSectionRef = useRef(null);

  const shellStrings = t('shell');
  const navLabels = t('nav');

  const sectionNavItems = useMemo(
    () => SECTION_IDS.map((id) => ({ id, label: navLabels[id] })),
    [navLabels]
  );

  // icon grid and start-menu popup both list every openable item including the terminal
  const desktopItems = useMemo(
    () => DESKTOP_ITEM_IDS.map((id) => ({ id, label: navLabels[id] })),
    [navLabels]
  );

  const openSection = (id) => {
    lastSectionRef.current = { id, label: navLabels[id] };
    if (mode === 'desktop') {
      openWindow(id, navLabels[id]);
    } else {
      setActiveSection(id);
    }
  };

  const handleCommand = (name, args) => {
    if (name === 'lang') {
      if (LANG_CODES.includes(args[0])) {
        setLang(args[0]);
      }
      return;
    }
    openSection(name);
  };

  // re-sync the other viewport mode's state when the mode itself changes, using
  // whatever was last opened, so the last-viewed section survives the breakpoint
  useEffect(() => {
    const last = lastSectionRef.current;
    if (!last) {
      return;
    }
    if (mode === 'desktop') {
      const alreadyOpen = windows.some((w) => w.id === last.id);
      if (!alreadyOpen) {
        openWindow(last.id, last.label);
      }
    } else if (activeSection === null && last.id !== 'terminal') {
      // mobile has no stacked-section view for the terminal, so there's nothing to
      // resurrect it as; leave the stacked view empty instead
      setActiveSection(last.id);
    }
    // reacts only to mode changes, see comment above
  }, [mode]);

  if (!booted) {
    return (
      <BootSequence
        lines={shellStrings.bootLines}
        lineDelayMs={400}
        onComplete={() => {
          setBooted(true);
          // land on a populated screen right after boot: the terminal on desktop,
          // About on mobile (which has no windowed terminal to open)
          openSection(mode === 'desktop' ? 'terminal' : 'about');
        }}
      />
    );
  }

  if (mode === 'desktop') {
    const activeId =
      windows.reduce((top, w) => (!top || w.zIndex > top.zIndex ? w : top), null)?.id ?? null;

    const openWindows = windows.map((w) => ({
      id: w.id,
      label: navLabels[w.id] ?? w.title,
    }));

    return (
      <div className="shell">
        <div className="space-bg" data-testid="space-bg" aria-hidden="true">
          <div className="space-bg__blackhole-core" />
          <div className="space-bg__blackhole-halo" />
        </div>
        <Desktop items={desktopItems} onOpen={openSection} />
        {windows.map((w) => {
          const isTerminal = w.id === 'terminal';
          const SectionComponent = isTerminal ? null : SECTIONS[w.id];
          return (
            <Window
              key={w.id}
              id={w.id}
              title={navLabels[w.id] ?? w.title}
              onClose={() => {
                if (lastSectionRef.current?.id === w.id) {
                  lastSectionRef.current = null;
                }
              }}
            >
              {isTerminal ? (
                <CommandPrompt
                  commandNames={[...SECTION_IDS, 'lang']}
                  onCommand={handleCommand}
                  notFoundMessage={shellStrings.commandNotFound}
                  helpIntro={shellStrings.helpIntro}
                  prompt={shellStrings.prompt}
                  hint={shellStrings.hint}
                />
              ) : (
                <SectionComponent />
              )}
            </Window>
          );
        })}
        <DesktopTaskbar
          menuLabel={shellStrings.menuLabel}
          menuItems={desktopItems}
          openWindows={openWindows}
          activeId={activeId}
          onOpen={openSection}
          onFocus={focusWindow}
          lang={lang}
          setLang={setLang}
        />
      </div>
    );
  }

  const ActiveMobileSection = activeSection ? SECTIONS[activeSection] : null;

  return (
    <div className="shell">
      <Taskbar
        navItems={sectionNavItems}
        openWindowIds={activeSection ? [activeSection] : []}
        activeId={activeSection}
        onNavClick={openSection}
      />
      <CommandPrompt
        commandNames={[...SECTION_IDS, 'lang']}
        onCommand={handleCommand}
        notFoundMessage={shellStrings.commandNotFound}
        helpIntro={shellStrings.helpIntro}
        prompt={shellStrings.prompt}
        hint={shellStrings.hint}
      />
      {ActiveMobileSection && (
        <div className="section-page" data-testid={`section-${activeSection}`}>
          <ActiveMobileSection />
        </div>
      )}
    </div>
  );
}

export function Shell() {
  return (
    <LanguageProvider>
      <WindowManagerProvider>
        <ShellBody />
      </WindowManagerProvider>
    </LanguageProvider>
  );
}

export default Shell;
