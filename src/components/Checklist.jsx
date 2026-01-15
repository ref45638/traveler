import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const Checklist = forwardRef(({ items = [], onAdd, onToggle, onDelete }, ref) => {
  const { t } = useLanguage();
  const [newItemText, setNewItemText] = useState("");
  const inputRef = useRef(null);

  // 暴露 focusInput 方法給父組件
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      inputRef.current?.focus();
    },
  }));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    onAdd(newItemText);
    setNewItemText("");
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div style={{ padding: "20px", paddingBottom: "100px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Input Area */}
      <form onSubmit={handleAdd} style={{ width: "100%", marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          ref={inputRef}
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder={t("addItemPlaceholder")}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            backgroundColor: "white",
            fontSize: "1rem",
            boxShadow: "var(--shadow-soft)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{
            borderRadius: "12px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={!newItemText.trim()}
        >
          <Plus size={24} />
        </button>
      </form>

      {/* List Area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {sortedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "var(--shadow-sm)",
                gap: "12px",
                opacity: item.completed ? 0.6 : 1,
              }}
            >
              <button
                onClick={() => onToggle(item.id, !item.completed)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: item.completed ? "var(--color-primary)" : "var(--color-text-light)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.completed ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>

              <span
                onClick={() => onToggle(item.id, !item.completed)}
                style={{
                  flex: 1,
                  textDecoration: item.completed ? "line-through" : "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {item.text}
              </span>

              <button
                onClick={() => onDelete(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px",
                  cursor: "pointer",
                  color: "#ff6b6b",
                  opacity: 0.8,
                }}
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && <div style={{ textAlign: "center", color: "var(--color-text-light)", marginTop: "40px" }}>{t("noItems")}</div>}
      </div>
    </div>
  );
});

export default Checklist;
