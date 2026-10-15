import { useState } from 'react';

export function CommandPrompt({
  commandNames,
  onCommand,
  notFoundMessage,
  helpIntro,
  prompt,
  hint,
}) {
  const [value, setValue] = useState('');
  // seed the log with a hint so an empty prompt isn't a dead end for first-time visitors
  const [log, setLog] = useState(() => (hint ? [hint] : []));

  const handleSubmit = (event) => {
    event.preventDefault();
    const tokens = value.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return;
    }
    const [rawName, ...args] = tokens;
    const name = rawName.toLowerCase();

    if (name === 'help') {
      setLog((prev) => [...prev, helpIntro, ...commandNames]);
    } else if (commandNames.includes(name)) {
      // echo it back so the typed line doesn't just vanish
      setLog((prev) => [...prev, [name, ...args].join(' ')]);
      onCommand(name, args);
    } else {
      setLog((prev) => [...prev, notFoundMessage]);
    }

    setValue('');
  };

  const inputLabel = prompt ? `${prompt} command input` : 'command input';

  return (
    <div>
      <div>
        {log.map((entry, index) => (
          <div key={index}>{entry}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {prompt && <span>{prompt}</span>}
        <input
          role="textbox"
          aria-label={inputLabel}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </form>
    </div>
  );
}
