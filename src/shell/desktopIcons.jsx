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

// standard Octocat mark as a flat silhouette, inline so there's no extra network request
function GitHubIcon() {
  return (
    <IconFrame>
      <path
        transform="translate(4 4) scale(0.67)"
        fill="currentColor"
        d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.725-1.333-1.725-1.089-.731.083-.716.083-.716 1.205.082 1.84 1.215 1.84 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.419-1.282.762-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209a11.5 11.5 0 0 1 3.003-.398c1.02.005 2.047.133 3.003.398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.912 24 17.497 24 12.292 24 5.78 18.627.5 12 .5Z"
      />
    </IconFrame>
  );
}

// cross+X spikes under a filled circle, leaving eight spike tips poking out
function MinesweeperIcon() {
  return (
    <IconFrame>
      <path
        d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      <circle cx="10.6" cy="10.6" r="1" fill="var(--bg)" fillOpacity="0.85" />
    </IconFrame>
  );
}

function SnakeIcon() {
  return (
    <IconFrame>
      <path
        d="M5.5 8.2c0-1.4 1.4-2.3 2.7-1.4.9.6.8 2.6-1.1 2.6s-2.9.9-2.9 2.7 1.9 3.2 3.7 2.3 1.8-2.7 3.6-2.7 3.5 1.3 3.5 3.3"
        {...STROKE}
      />
      <circle cx="18.3" cy="6.7" r="1.3" fill="currentColor" />
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
  github: GitHubIcon,
  minesweeper: MinesweeperIcon,
  snake: SnakeIcon,
};
