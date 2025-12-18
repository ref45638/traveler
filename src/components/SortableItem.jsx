import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock, Pencil, Trash2 } from "lucide-react";
import { getAssetUrl } from "../utils/imagePath";
import { useLanguage } from "../context/LanguageContext";

export function SortableItem({ id, item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const { t } = useLanguage();

  // 使用 Translate 而不是 Transform，這樣不會縮放到目標位置的大小
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginBottom: "15px",
    padding: "15px",
    display: "flex",
    gap: "10px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
    position: "relative",
    // 拖動時的視覺效果
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div
        {...attributes}
        {...listeners}
        style={{
          display: "flex",
          alignItems: "center",
          color: "#ccc",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "pan-y", // 允許垂直滾動，只阻止水平手勢
          padding: "10px 5px",
          margin: "-10px -5px",
        }}
      >
        <GripVertical size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "5px", paddingRight: "60px" }}>{item.title}</h3>
        {item.time && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--color-primary)", fontSize: "0.9rem", marginBottom: "5px" }}>
            <Clock size={14} />
            <span>{item.time}</span>
          </div>
        )}
        {item.description && <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", whiteSpace: "pre-wrap" }}>{item.description}</p>}
        {item.image && (
          <img
            src={getAssetUrl(item.image)}
            alt="Note"
            style={{ marginTop: "10px", borderRadius: "8px", maxWidth: "100%", maxHeight: "200px", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "5px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          style={{ padding: "5px", color: "var(--color-text-light)", background: "none" }}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(t("deleteItemConfirm"))) onDelete(item.id);
          }}
          style={{ padding: "5px", color: "#ff6b6b", background: "none" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
