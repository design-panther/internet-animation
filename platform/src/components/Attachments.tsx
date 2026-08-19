import type { Attachment } from "@/lib/content";

export function Attachments({ items }: { items: Attachment[] }) {
  if (items.length === 0) return null;
  const images = items.filter((a) => a.kind === "image" || a.kind === "scan");
  const audio = items.filter((a) => a.kind === "audio");
  const other = items.filter((a) => a.kind === "other");

  return (
    <div className="panel">
      <h3>Attachments</h3>
      {audio.length > 0 && (
        <div>
          {audio.map((a) => (
            <div className="audio-row" key={a.name}>
              <div className="name">{a.name}</div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={a.url} preload="none" />
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div className="gallery">
          {images.map((a) => (
            <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.name} loading="lazy" />
            </a>
          ))}
        </div>
      )}
      {other.map((a) => (
        <div key={a.name}>
          <a href={a.url} target="_blank" rel="noopener noreferrer">
            {a.name}
          </a>
        </div>
      ))}
    </div>
  );
}
