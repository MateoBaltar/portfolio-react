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
import { GitHubStats } from '../apps/GitHubStats';
import { Minesweeper } from '../apps/Minesweeper';

const SECTIONS = {
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  contact: Contact,
  github: GitHubStats,
  minesweeper: Minesweeper,
};

const SECTION_IDS = Object.keys(SECTIONS);
// Desktop mode adds one more openable "app" beyond the content sections:
// the terminal itself now lives inside its own window instead of being
// permanently docked, so it needs a place in the icon grid/start menu.
const DESKTOP_ITEM_IDS = [...SECTION_IDS, 'terminal'];

const LANG_CODES = ['en', 'es'];

// A small neofetch-style block. The ASCII art stays constant across
// languages; the stats line labels come from the dictionary.
const ASCII_FLAME = ['  (', ' ) \\', '( ) )', ' )_/'];

function buildFetchLines(t) {
  const fetchStrings = t('shell').fetch;
  const contact = t('contact');
  const languagesCategory = t('skills').categories.find((c) => c.items?.includes('Python'));
  const languages = languagesCategory ? languagesCategory.items.slice(0, 3).join(', ') : '';

  const statLines = [
    `${fetchStrings.osLabel}: FireOS v1.0`,
    `${fetchStrings.shellLabel}: fireos-sh`,
    `${fetchStrings.hostLabel}: ${contact.location}`,
    `${fetchStrings.languagesLabel}: ${languages}`,
  ];

  const lineCount = Math.max(ASCII_FLAME.length, statLines.length);
  const lines = [];
  for (let i = 0; i < lineCount; i += 1) {
    const art = (ASCII_FLAME[i] ?? '').padEnd(8);
    lines.push(`${art}${statLines[i] ?? ''}`);
  }
  return lines;
}

// not listed in commandNames/help, found by trying rather than reading
const EASTER_EGGS = {
  sudo: "nice try, you're not root here.",
  rm: 'nothing was harmed. probably for the best.',
  sl: '   choo choo, you probably meant "ls".',
  coffee: 'brewing... still faster than a cold deploy.',
};

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

  // Shared by both CommandPrompt instances (the windowed terminal on
  // desktop, the permanently-docked one on mobile) so `fetch`/easter eggs
  // work identically everywhere the terminal exists.
  const terminalCommandNames = useMemo(() => [...SECTION_IDS, 'lang', 'fetch'], []);
  const terminalExtraCommands = useMemo(() => ({ fetch: () => buildFetchLines(t) }), [t]);

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
          <div className="space-bg__star space-bg__star--1" />
          <div className="space-bg__star space-bg__star--2" />
          <div className="space-bg__star space-bg__star--3" />
          <div className="space-bg__star space-bg__star--4" />
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
                  commandNames={terminalCommandNames}
                  onCommand={handleCommand}
                  notFoundMessage={shellStrings.commandNotFound}
                  helpIntro={shellStrings.helpIntro}
                  prompt={shellStrings.prompt}
                  hint={shellStrings.hint}
                  extraCommands={terminalExtraCommands}
                  easterEggs={EASTER_EGGS}
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
        commandNames={terminalCommandNames}
        onCommand={handleCommand}
        notFoundMessage={shellStrings.commandNotFound}
        helpIntro={shellStrings.helpIntro}
        prompt={shellStrings.prompt}
        hint={shellStrings.hint}
        extraCommands={terminalExtraCommands}
        easterEggs={EASTER_EGGS}
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
