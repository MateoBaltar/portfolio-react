import { useEffect, useMemo, useRef, useState } from 'react';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { WindowManagerProvider, useWindowManager } from '../windows/WindowManagerContext';
import { Window } from '../windows/Window';
import { useViewportMode } from '../hooks/useViewportMode';
import { BootSequence } from './BootSequence';
import { CommandPrompt } from './CommandPrompt';
import { Taskbar } from './Taskbar';
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

const LANG_CODES = ['en', 'es'];

function ShellBody() {
  const { t, setLang } = useLanguage();
  const mode = useViewportMode();
  const { windows, openWindow } = useWindowManager();
  const [booted, setBooted] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  // Tracks the most recently opened section independent of viewport mode,
  // without itself triggering a re-render. Mobile nav/command clicks only
  // ever touch this ref + activeSection — they never write to `windows` —
  // so navigating several sections on mobile never accumulates a backlog of
  // window records.
  const lastSectionRef = useRef(null);

  const shellStrings = t('shell');
  const navLabels = t('nav');

  const navItems = useMemo(
    () => SECTION_IDS.map((id) => ({ id, label: navLabels[id] })),
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

  // Catch up the *other* branch's state only when the viewport mode itself
  // actually changes, using whatever was last explicitly opened via
  // nav/command — never the full history of sections visited in the other
  // mode. This keeps "exactly one window on desktop" and "no window writes
  // on mobile" both true, while still surfacing the last-viewed section
  // across the breakpoint in either direction.
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
    } else if (activeSection === null) {
      setActiveSection(last.id);
    }
    // Intentionally omitted from deps: this effect reacts only to `mode`
    // changes. `windows`/`activeSection` change as a result of this effect's
    // own catch-up calls, and `openWindow`/`setActiveSection` are stable
    // setters, so including them would cause unwanted re-runs.
  }, [mode]);

  if (!booted) {
    return (
      <BootSequence
        lines={shellStrings.bootLines}
        lineDelayMs={400}
        onComplete={() => {
          setBooted(true);
          // Land on a populated screen right after boot instead of a blank
          // page — auto-open the about section once so a visitor sees
          // name/content immediately without having to click or type first.
          openSection('about');
        }}
      />
    );
  }

  const openWindowIds =
    mode === 'desktop' ? windows.map((w) => w.id) : activeSection ? [activeSection] : [];

  const activeId =
    mode === 'desktop'
      ? windows.reduce((top, w) => (!top || w.zIndex > top.zIndex ? w : top), null)?.id ?? null
      : activeSection;

  const ActiveMobileSection = activeSection ? SECTIONS[activeSection] : null;

  return (
    <div>
      <Taskbar
        navItems={navItems}
        openWindowIds={openWindowIds}
        activeId={activeId}
        onNavClick={openSection}
      />
      <CommandPrompt
        commandNames={[...SECTION_IDS, 'lang']}
        onCommand={(name, args) => {
          if (name === 'lang') {
            if (LANG_CODES.includes(args[0])) {
              setLang(args[0]);
            }
            return;
          }
          openSection(name);
        }}
        notFoundMessage={shellStrings.commandNotFound}
        helpIntro={shellStrings.helpIntro}
        prompt={shellStrings.prompt}
        hint={shellStrings.hint}
      />
      {mode === 'desktop'
        ? windows.map((w) => {
            const SectionComponent = SECTIONS[w.id];
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
                <SectionComponent />
              </Window>
            );
          })
        : ActiveMobileSection && (
            <div data-testid={`section-${activeSection}`}>
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
