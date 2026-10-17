export function Desktop({ items, onOpen }) {
  return (
    <div className="desktop">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="desktop__icon"
          data-testid={`desktop-icon-${item.id}`}
          onDoubleClick={() => onOpen(item.id)}
        >
          <span className="desktop__icon-glyph">{item.label.charAt(0)}</span>
          <span className="desktop__icon-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Desktop;
