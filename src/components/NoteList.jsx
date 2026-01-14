import React from "react";
import { Trash2, Edit2, GripVertical, FileText } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getAssetUrl } from "../utils/imagePath";

const SortableNoteItem = ({ item, onDelete, onEdit, t }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "flex-start",
    padding: "15px",
    marginBottom: "10px",
    position: "relative",
    backgroundColor: "white",
    zIndex: transform ? 999 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div {...attributes} {...listeners} style={{ cursor: "grab", marginRight: "10px", color: "#ccc", paddingTop: "3px" }}>
        <GripVertical size={20} />
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#FFF5BA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          marginRight: "15px",
          flexShrink: 0,
        }}
      >
        <FileText size={20} color="#F59E0B" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "8px" }}>{item.title}</div>
        {item.content && (
          <div
            className="note-content-preview"
            dangerouslySetInnerHTML={{ __html: item.content }}
            style={{
              fontSize: "0.85rem",
              color: "#666",
              lineHeight: "1.5",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginLeft: "10px" }}>
        <button onClick={() => onEdit(item)} style={{ color: "#888", background: "none", padding: "5px" }}>
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => {
            if (window.confirm(t("deleteNoteConfirm") || "Delete this note?")) {
              onDelete(item.id);
            }
          }}
          style={{ color: "#ff6b6b", background: "none", padding: "5px" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const NoteList = ({ notes, onDelete, onEdit, onReorder }) => {
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 400,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!notes || notes.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--color-text)",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "20px",
          border: "2px dashed var(--color-primary)",
          boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
        }}
      >
        <img src={getAssetUrl("/images/No_Activities.png")} alt="No notes" style={{ width: "150px", opacity: 1, marginBottom: "15px" }} />
        <p style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "5px" }}>{t("noNotes") || "還沒有筆記"}</p>
        <p style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-light)" }}>{t("tapToAddNote") || "點擊 + 新增一個吧"}</p>
      </div>
    );
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = notes.findIndex((item) => item.id === active.id);
      const newIndex = notes.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(notes, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={notes.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {notes.map((item) => (
            <SortableNoteItem key={item.id} item={item} onDelete={onDelete} onEdit={onEdit} t={t} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default NoteList;
