"use client";

/**
 * Whiteboard integration for the agent control board — a self-contained tldraw
 * shape module so any wiki inherits "drop a kanban on the whiteboard" by copying
 * the kanban files and wiring three lines into Whiteboard.tsx:
 *
 *   import { KanbanShapeUtil, insertKanban } from "@/components/KanbanShape";
 *   const CUSTOM_SHAPE_UTILS = [ …, KanbanShapeUtil ];
 *   <button onClick={() => insertKanban(editor)}>▦ Board</button>
 *
 * The shape stores only a boardId; the tasks live in `_kanban/<id>.json`, loaded
 * live and written back, so the file (which agents edit) stays the source of truth.
 */
import {
  type Editor,
  HTMLContainer,
  Rectangle2d,
  type RecordProps,
  resizeBox,
  ShapeUtil,
  stopEventPropagation,
  T,
  type TLBaseShape,
  type TLResizeInfo,
} from "tldraw";
import KanbanBoard from "@/components/KanbanBoard";

// Register the shape in tldraw's type system (merged with the app's other shapes).
declare module "@tldraw/tlschema" {
  interface TLGlobalShapePropsMap {
    kanban: { w: number; h: number; boardId: string; title: string };
  }
}

export type KanbanShape = TLBaseShape<
  "kanban",
  { w: number; h: number; boardId: string; title: string }
>;

export class KanbanShapeUtil extends ShapeUtil<KanbanShape> {
  static override type = "kanban" as const;
  static override props: RecordProps<KanbanShape> = {
    w: T.number,
    h: T.number,
    boardId: T.string,
    title: T.string,
  };
  override getDefaultProps(): KanbanShape["props"] {
    return { w: 820, h: 560, boardId: "control-board", title: "Control Board" };
  }
  override getGeometry(shape: KanbanShape) {
    return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true });
  }
  override canEdit() {
    return true;
  }
  override canResize() {
    return true;
  }
  override onResize(shape: KanbanShape, info: TLResizeInfo<KanbanShape>) {
    return resizeBox(shape, info);
  }
  override getIndicatorPath(shape: KanbanShape) {
    const p = new Path2D();
    p.rect(0, 0, shape.props.w, shape.props.h);
    return p;
  }
  override component(shape: KanbanShape) {
    const editing = this.editor.getEditingShapeId() === shape.id;
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid #2a2f3a",
          boxShadow: "0 8px 30px rgba(0,0,0,.45)",
          background: "#0e1014",
          pointerEvents: editing ? "all" : "none",
        }}
        onPointerDown={editing ? stopEventPropagation : undefined}
      >
        <KanbanBoard boardId={shape.props.boardId} />
        {!editing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              padding: 8,
              font: "11px system-ui",
              color: "#cbd5e1",
              background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0) 22%)",
            }}
          >
            <span>▦ {shape.props.title} · double-click to use</span>
          </div>
        )}
      </HTMLContainer>
    );
  }
}

/** Drop a control board at the center of the current viewport. */
export function insertKanban(editor: Editor, boardId = "control-board", title = "Control Board") {
  const w = 820;
  const h = 560;
  const c = editor.getViewportPageBounds().center;
  editor.createShape<KanbanShape>({
    type: "kanban",
    x: c.x - w / 2,
    y: c.y - h / 2,
    props: { boardId, title, w, h },
  });
}
