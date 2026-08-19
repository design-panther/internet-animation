import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

/**
 * Full-page control board. The board is fixed to the viewport (below any mobile
 * bar) so the kanban + timeline own the screen; the same component also renders
 * inside the whiteboard as a droppable shape.
 */
export default function KanbanPage() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
      <KanbanBoard boardId="control-board" />
    </div>
  );
}
