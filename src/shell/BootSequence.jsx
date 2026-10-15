import { useEffect, useRef, useState } from 'react';

export function BootSequence({ lines, lineDelayMs = 400, onComplete = () => {} }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (lines.length === 0) {
      onCompleteRef.current();
      return undefined;
    }

    let cancelled = false;
    let count = 0;

    const revealNext = () => {
      count += 1;
      if (cancelled) {
        return;
      }
      setVisibleCount(count);
      if (count >= lines.length) {
        onCompleteRef.current();
      } else {
        timeoutId = setTimeout(revealNext, lineDelayMs);
      }
    };

    let timeoutId = setTimeout(revealNext, lineDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [lines, lineDelayMs]);

  return (
    <div className="boot">
      {lines.slice(0, visibleCount).map((line, index) => (
        <div className="boot__line" key={index}>
          {line}
        </div>
      ))}
      <span className="boot__cursor" aria-hidden="true">
        ▊
      </span>
    </div>
  );
}
