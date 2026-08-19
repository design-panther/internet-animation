"use client";

import "tldraw/tldraw.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AssetRecordType,
  type Editor,
  getHashForString,
  getSnapshot,
  HTMLContainer,
  loadSnapshot,
  Rectangle2d,
  type RecordProps,
  resizeBox,
  ShapeUtil,
  stopEventPropagation,
  T,
  type TLBaseShape,
  type TLResizeInfo,
  Tldraw,
} from "tldraw";
import { KanbanShapeUtil, insertKanban } from "@/components/KanbanShape";

// Register our custom shapes in tldraw's type system so they become first-class
// TLShapes (this is what makes createShape/resizeBox/ShapeUtil type-check for them).
declare module "@tldraw/tlschema" {
  interface TLGlobalShapePropsMap {
    animation: { w: number; h: number; url: string; title: string };
    doc: { w: number; h: number; slug: string; title: string };
  }
}

// ---------------------------------------------------------------------------
// Custom shape: a resizable animation frame (embeds an HTML animation / storymap)
// ---------------------------------------------------------------------------
type AnimationShape = TLBaseShape<
  "animation",
  { w: number; h: number; url: string; title: string }
>;

class AnimationShapeUtil extends ShapeUtil<AnimationShape> {
  static override type = "animation" as const;
  static override props: RecordProps<AnimationShape> = {
    w: T.number,
    h: T.number,
    url: T.string,
    title: T.string,
  };

  override getDefaultProps(): AnimationShape["props"] {
    return { w: 360, h: 270, url: "", title: "animation" };
  }
  override getGeometry(shape: AnimationShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }
  override canEdit() {
    return true;
  }
  override canResize() {
    return true;
  }
  override onResize(shape: AnimationShape, info: TLResizeInfo<AnimationShape>) {
    return resizeBox(shape, info);
  }
  override getIndicatorPath(shape: AnimationShape) {
    const p = new Path2D();
    p.rect(0, 0, shape.props.w, shape.props.h);
    return p;
  }

  override component(shape: AnimationShape) {
    const editing = this.editor.getEditingShapeId() === shape.id;
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          overflow: "hidden",
          borderRadius: 10,
          border: "1px solid #0f766e",
          boxShadow: "0 6px 22px rgba(0,0,0,.18)",
          background: "#000",
          pointerEvents: editing ? "all" : "none",
        }}
      >
        <iframe
          src={shape.props.url}
          title={shape.props.title || "animation"}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
        {!editing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              padding: 6,
              font: "11px system-ui",
              color: "#fff",
              background:
                "linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0) 40%)",
            }}
          >
            <span>🎞 {shape.props.title} · double-click to interact</span>
          </div>
        )}
      </HTMLContainer>
    );
  }

}

// ---------------------------------------------------------------------------
// Custom shape: an editable document card. Stores only a reference (slug); the
// body is loaded live from the file and edits are written back to the file, so
// the Markdown file stays the source of truth.
// ---------------------------------------------------------------------------
type DocShape = TLBaseShape<
  "doc",
  { w: number; h: number; slug: string; title: string }
>;

function DocCard({ shape, editing }: { shape: DocShape; editing: boolean }) {
  const [body, setBody] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    let live = true;
    fetch(`/api/entry?slug=${encodeURIComponent(shape.props.slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        const b = typeof d.body === "string" ? d.body : "";
        setBody(b);
        setDraft(b);
      })
      .catch(() => live && setBody(""));
    return () => {
      live = false;
    };
  }, [shape.props.slug]);

  async function save() {
    if (draft === body) return;
    setSaving("saving");
    try {
      await fetch("/api/entry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: shape.props.slug, body: draft }),
      });
      setBody(draft);
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1200);
    } catch {
      setSaving("idle");
    }
  }

  return (
    <HTMLContainer
      style={{
        width: shape.props.w,
        height: shape.props.h,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        border: "1px solid #d8d2c4",
        background: "#fffdf8",
        boxShadow: "0 6px 22px rgba(0,0,0,.12)",
        overflow: "hidden",
        pointerEvents: editing ? "all" : "none",
      }}
    >
      <div
        style={{
          padding: "6px 10px",
          borderBottom: "1px solid #eee6d6",
          font: "600 12px system-ui",
          color: "#0f766e",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span>📄 {shape.props.title}</span>
        <span style={{ marginLeft: "auto", color: "#9a8", fontWeight: 400 }}>
          {editing
            ? saving === "saving"
              ? "saving…"
              : saving === "saved"
                ? "saved ✓"
                : "editing"
            : "double-click to edit"}
        </span>
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onPointerDown={stopEventPropagation}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
            e.stopPropagation();
          }}
          style={{
            flex: 1,
            resize: "none",
            border: 0,
            outline: "none",
            padding: 10,
            font: "13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
            background: "transparent",
            color: "#2a2a2a",
          }}
        />
      ) : (
        <pre
          style={{
            flex: 1,
            margin: 0,
            padding: 10,
            font: "13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "hidden",
            color: "#2a2a2a",
          }}
        >
          {body ?? "Loading…"}
        </pre>
      )}
    </HTMLContainer>
  );
}

class DocShapeUtil extends ShapeUtil<DocShape> {
  static override type = "doc" as const;
  static override props: RecordProps<DocShape> = {
    w: T.number,
    h: T.number,
    slug: T.string,
    title: T.string,
  };

  override getDefaultProps(): DocShape["props"] {
    return { w: 340, h: 260, slug: "", title: "document" };
  }
  override getGeometry(shape: DocShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }
  override canEdit() {
    return true;
  }
  override canResize() {
    return true;
  }
  override onResize(shape: DocShape, info: TLResizeInfo<DocShape>) {
    return resizeBox(shape, info);
  }
  override component(shape: DocShape) {
    return <DocCard shape={shape} editing={this.editor.getEditingShapeId() === shape.id} />;
  }
  override getIndicatorPath(shape: DocShape) {
    const p = new Path2D();
    p.rect(0, 0, shape.props.w, shape.props.h);
    return p;
  }
}

const CUSTOM_SHAPE_UTILS = [AnimationShapeUtil, DocShapeUtil, KanbanShapeUtil];

// ---------------------------------------------------------------------------
// Asset picker — place repo files "found in the file system" onto the canvas
// ---------------------------------------------------------------------------
interface AnimationItem {
  source: "local" | "rig";
  name: string;
  url?: string; // local: same-origin html path
  slug?: string; // rig
  htmlPath?: string; // rig-relative html
  thumbnailPath?: string; // rig-relative thumbnail
}
interface AssetsData {
  images: { name: string; url: string }[];
  animations: AnimationItem[];
  docs: { title: string; slug: string; id?: string; type: string }[];
  rigOnline?: boolean;
}
type Tab = "images" | "animations" | "docs";

/** The viewer rig runs on :3000 of whatever host is serving the board (localhost
 * on desktop, the Mac's LAN IP from the iPad), so build its URLs from location. */
function rigBase(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.hostname}:3000`;
}
function animEmbedUrl(a: AnimationItem): string {
  return a.source === "rig" ? rigBase() + (a.htmlPath ?? "") : (a.url ?? "");
}
function animThumb(a: AnimationItem): string | null {
  return a.source === "rig" && a.thumbnailPath ? rigBase() + a.thumbnailPath : null;
}

function loadImageDims(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ w: img.naturalWidth || 480, h: img.naturalHeight || 360 });
    img.onerror = () => resolve({ w: 480, h: 360 });
    img.src = url;
  });
}

function mimeFor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return (
    { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", avif: "image/avif" }[
      ext ?? ""
    ] ?? "image/png"
  );
}

function AssetPanel({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("images");
  const [data, setData] = useState<AssetsData | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open && !data) {
      fetch("/api/assets")
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData({ images: [], animations: [], docs: [], rigOnline: false }));
    }
  }, [open, data]);

  function center() {
    const b = editor.getViewportPageBounds();
    return { x: b.midX, y: b.midY };
  }

  async function insertImage(url: string, name: string) {
    const dims = await loadImageDims(url);
    const assetId = AssetRecordType.createId(getHashForString(url));
    if (!editor.getAsset(assetId)) {
      editor.createAssets([
        AssetRecordType.create({
          id: assetId,
          type: "image",
          typeName: "asset",
          props: {
            name,
            src: url,
            w: dims.w,
            h: dims.h,
            mimeType: mimeFor(name),
            isAnimated: /\.gif$/i.test(name),
          },
          meta: {},
        }),
      ]);
    }
    const w = Math.min(dims.w, 480);
    const h = (w * dims.h) / dims.w;
    const p = center();
    editor.createShape({ type: "image", x: p.x - w / 2, y: p.y - h / 2, props: { assetId, w, h } });
  }

  function insertAnimation(url: string, title: string) {
    const w = 360;
    const h = 270;
    const p = center();
    editor.createShape<AnimationShape>({
      type: "animation",
      x: p.x - w / 2,
      y: p.y - h / 2,
      props: { url, title, w, h },
    });
  }

  function insertDoc(slug: string, title: string) {
    const w = 340;
    const h = 300;
    const p = center();
    editor.createShape<DocShape>({
      type: "doc",
      x: p.x - w / 2,
      y: p.y - h / 2,
      props: { slug, title, w, h },
    });
  }

  const items =
    tab === "images"
      ? (data?.images ?? []).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
      : tab === "animations"
        ? (data?.animations ?? []).filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
        : (data?.docs ?? []).filter((d) =>
            (d.title + " " + (d.id ?? "")).toLowerCase().includes(q.toLowerCase()),
          );

  if (!open) {
    return (
      <button className="wb-fab" onClick={() => setOpen(true)} title="Insert from repo">
        ＋ Insert
      </button>
    );
  }

  return (
    <div className="wb-panel">
      <div className="wb-panel-head">
        <strong>Insert</strong>
        <button className="wb-tab" onClick={() => { insertKanban(editor); setOpen(false); }} title="Drop the agent control board">
          ▦ Board
        </button>
        <button className="wb-x" onClick={() => setOpen(false)} title="Hide">
          ×
        </button>
      </div>
      <div className="wb-tabs">
        {(["images", "animations", "docs"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`wb-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "images" ? "Images" : t === "animations" ? "Animations" : "Docs"}
          </button>
        ))}
      </div>
      <input
        className="wb-search"
        placeholder="Filter…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="wb-list">
        {!data && <div className="wb-empty">Loading…</div>}
        {data && items.length === 0 && <div className="wb-empty">Nothing here.</div>}

        {tab === "images" &&
          (items as AssetsData["images"]).map((i) => (
            <button key={i.url} className="wb-thumb" onClick={() => insertImage(i.url, i.name)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.url} alt={i.name} loading="lazy" />
              <span>{i.name}</span>
            </button>
          ))}

        {tab === "animations" && data && data.rigOnline === false && (
          <div className="wb-note">
            Viewer rig offline — start it on <code>:3000</code> to browse the
            animation library.
          </div>
        )}
        {tab === "animations" && (
          <div className="wb-anim-grid">
            {(items as AnimationItem[]).map((a) => {
              const thumb = animThumb(a);
              return (
                <button
                  key={`${a.source}:${a.slug ?? a.url}`}
                  className="wb-anim"
                  title={a.name}
                  onClick={() => insertAnimation(animEmbedUrl(a), a.name)}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={a.name} loading="lazy" />
                  ) : (
                    <div className="wb-anim-ph">🎞</div>
                  )}
                  <span>{a.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {tab === "docs" &&
          (items as AssetsData["docs"]).map((d) => (
            <button key={d.slug} className="wb-row" onClick={() => insertDoc(d.slug, d.title)}>
              📄 <span>{d.id ? `${d.id} · ` : ""}{d.title}</span>
            </button>
          ))}
      </div>
      <div className="wb-hint">
        Drag images straight from Finder too. Draw with the pencil tool · Apple
        Pencil supported.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The board itself: full-canvas tldraw with file-backed autosave
// ---------------------------------------------------------------------------
export default function Whiteboard({ slug, title }: { slug: string; title: string }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const savedOnce = useRef(false);

  const handleMount = useCallback(
    (ed: Editor) => {
      setEditor(ed);
      let timer: ReturnType<typeof setTimeout> | undefined;

      // Load the saved canvas from its file.
      fetch(`/api/board?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.snapshot && d.snapshot.document) {
            loadSnapshot(ed.store, d.snapshot);
          }
        })
        .catch(() => {});

      // Autosave user edits (debounced) back to the file.
      const unlisten = ed.store.listen(
        () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            const snapshot = getSnapshot(ed.store);
            fetch("/api/board", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, snapshot }),
            }).catch(() => {});
            savedOnce.current = true;
          }, 800);
        },
        { source: "user", scope: "document" },
      );

      return () => {
        if (timer) clearTimeout(timer);
        unlisten();
      };
    },
    [slug],
  );

  return (
    <div className="board-stage">
      <div className="board-topbar">
        <Link href="/boards" className="wb-back">
          ← Boards
        </Link>
        <span className="board-title">▨ {title}</span>
        <span className="board-save">saved to file · autosaves</span>
      </div>
      <div className="board-canvas">
        <Tldraw onMount={handleMount} shapeUtils={CUSTOM_SHAPE_UTILS} />
        {editor && <AssetPanel editor={editor} />}
      </div>
    </div>
  );
}
