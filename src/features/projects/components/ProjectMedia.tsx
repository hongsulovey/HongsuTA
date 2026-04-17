import type { ProjectMedia as ProjectMediaType } from "@/features/projects/data/projects";

type ProjectMediaProps = {
  media: ProjectMediaType;
  className?: string;
  /** When true, captions are rendered below the media. Defaults to true. */
  showCaption?: boolean;
  /** Optional priority hint for above-the-fold media (e.g. hero). */
  eager?: boolean;
};

/**
 * Renders a single project media asset (image / gif / video) with an optional
 * caption. Videos autoplay muted and inline — suitable for short loops.
 * Uses plain <img> instead of next/image so arbitrary aspect ratios and
 * formats (svg / gif) work without width/height metadata.
 */
export function ProjectMedia({
  media,
  className,
  showCaption = true,
  eager = false,
}: ProjectMediaProps) {
  const frameClass = `project-media ${className ?? ""}`.trim();
  const style = media.aspect ? { aspectRatio: media.aspect } : undefined;

  if (media.type === "video") {
    return (
      <figure className={frameClass}>
        <div className="project-media__frame" style={style}>
          <video
            className="project-media__video"
            src={media.src}
            poster={media.poster}
            autoPlay
            loop
            muted
            playsInline
            preload={eager ? "auto" : "metadata"}
          />
        </div>
        {showCaption && media.caption ? (
          <figcaption className="project-media__caption">{media.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className={frameClass}>
      <div className="project-media__frame" style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="project-media__image"
          src={media.src}
          alt={media.alt ?? ""}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      {showCaption && media.caption ? (
        <figcaption className="project-media__caption">{media.caption}</figcaption>
      ) : null}
    </figure>
  );
}
