import { useState } from 'react';
import { playKey } from './sound';

// always available no matter what the host app passes in as commandNames
const BUILT_IN_COMMANDS = ['help', 'clear'];

export function CommandPrompt({
  commandNames,
  onCommand,
  notFoundMessage,
  helpIntro,
  prompt,
  hint,
  commandDescriptions = {},
  extraCommands = {},
  easterEggs = {},
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
      const lines = [...BUILT_IN_COMMANDS, ...commandNames].map((cmd) => {
        const description = commandDescriptions[cmd];
        return description ? `${cmd} - ${description}` : cmd;
      });
      setLog((prev) => [...prev, helpIntro, ...lines]);
    } else if (name === 'clear') {
      setLog([]);
    } else if (commandNames.includes(name)) {
      // echo it back so the typed line doesn't just vanish
      const echoLine = [name, ...args].join(' ');
      if (extraCommands[name]) {
        // run any side effect (e.g. lang calling setLang) as a plain statement here,
        // not inside the setLog updater below; React can call updaters during render
        const resultLines = extraCommands[name](args);
        setLog((prev) => [...prev, echoLine, ...resultLines]);
      } else {
        setLog((prev) => [...prev, echoLine]);
        onCommand(name, args);
      }
    } else if (easterEggs[name]) {
      // not in commandNames/help on purpose, found by trying
      setLog((prev) => [...prev, [name, ...args].join(' '), easterEggs[name]]);
    } else {
      setLog((prev) => [...prev, notFoundMessage]);
    }

    setValue('');
  };

  const inputLabel = prompt ? `${prompt} command input` : 'command input';

  return (
    <div className="prompt">
      <div className="prompt__log">
        {log.map((entry, index) => (
          <div className="prompt__log-line" key={index}>
            {entry}
          </div>
        ))}
      </div>
      <form className="prompt__form" onSubmit={handleSubmit}>
        {prompt && <span className="prompt__sigil">{prompt}</span>}
        <input
          className="prompt__input"
          role="textbox"
          aria-label={inputLabel}
          value={value}
          onChange={(event) => {
            playKey();
            setValue(event.target.value);
          }}
        />
      </form>
    </div>
  );
}
