function IconBase({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function AboutIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </IconBase>
  );
}

function SkillsIcon() {
  return (
    <IconBase>
      <path d="M14.7 6.3a3.2 3.2 0 0 0-4.3 3.9L5 15.6v3.1h3.1l5.4-5.4a3.2 3.2 0 0 0 3.9-4.3l-2.4 2.4-1.7-1.7Z" />
    </IconBase>
  );
}

function ExperienceIcon() {
  return (
    <IconBase>
      <rect x="3.5" y="8" width="17" height="11" rx="1.5" />
      <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      <path d="M3.5 13h17" />
    </IconBase>
  );
}

function ProjectsIcon() {
  return (
    <IconBase>
      <path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h4l1.6 2H19a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z" />
    </IconBase>
  );
}

function ContactIcon() {
  return (
    <IconBase>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M4 6.5 12 13l8-6.5" />
    </IconBase>
  );
}

export const DESKTOP_ICONS = {
  about: AboutIcon,
  skills: SkillsIcon,
  experience: ExperienceIcon,
  projects: ProjectsIcon,
  contact: ContactIcon,
};
