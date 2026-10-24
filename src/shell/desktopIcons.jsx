const STROKE = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};

function IconFrame({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="currentColor" fillOpacity="0.12" />
      {children}
    </svg>
  );
}

function AboutIcon() {
  return (
    <IconFrame>
      <circle cx="12" cy="9.2" r="3" {...STROKE} />
      <path d="M6 18.3c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" {...STROKE} />
      <circle cx="12" cy="9.2" r="1" fill="currentColor" fillOpacity="0.5" />
    </IconFrame>
  );
}

function SkillsIcon() {
  return (
    <IconFrame>
      <path
        d="M14.3 6.7a3 3 0 0 0-4 3.6L5.5 15.1v2.9h2.9l4.8-4.8a3 3 0 0 0 3.6-4l-2.2 2.2-1.6-1.6Z"
        {...STROKE}
      />
      <circle cx="9.3" cy="14.7" r="0.9" fill="currentColor" />
    </IconFrame>
  );
}

function ExperienceIcon() {
  return (
    <IconFrame>
      <rect x="4" y="8.5" width="16" height="10" rx="1.4" {...STROKE} />
      <path d="M9 8.5V6.8a1.8 1.8 0 0 1 1.8-1.8h2.4a1.8 1.8 0 0 1 1.8 1.8v1.7" {...STROKE} />
      <rect x="10.6" y="12" width="2.8" height="2" rx="0.5" fill="currentColor" />
    </IconFrame>
  );
}

function ProjectsIcon() {
  return (
    <IconFrame>
      <path
        d="M4 8a1.4 1.4 0 0 1 1.4-1.4h3.6l1.5 1.8h8.1A1.4 1.4 0 0 1 20 9.8v7.3A1.4 1.4 0 0 1 18.6 18.5H5.4A1.4 1.4 0 0 1 4 17.1Z"
        {...STROKE}
      />
      <rect x="5.4" y="10.3" width="4.4" height="1.6" rx="0.6" fill="currentColor" fillOpacity="0.5" />
    </IconFrame>
  );
}

function ContactIcon() {
  return (
    <IconFrame>
      <rect x="4" y="6" width="16" height="12" rx="1.4" {...STROKE} />
      <path d="M4.6 7 12 12.6 19.4 7" {...STROKE} />
      <circle cx="17.3" cy="15.3" r="1" fill="currentColor" />
    </IconFrame>
  );
}

function TerminalIcon() {
  return (
    <IconFrame>
      <rect x="4" y="5.5" width="16" height="13" rx="1.6" {...STROKE} />
      <path d="M7.3 9.5l2.6 2.6-2.6 2.6" {...STROKE} />
      <path d="M12.3 14.7h4.3" {...STROKE} />
    </IconFrame>
  );
}

export const DESKTOP_ICONS = {
  about: AboutIcon,
  skills: SkillsIcon,
  experience: ExperienceIcon,
  projects: ProjectsIcon,
  contact: ContactIcon,
  terminal: TerminalIcon,
};
