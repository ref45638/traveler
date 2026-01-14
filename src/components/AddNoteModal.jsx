import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const AddNoteModal = ({ onClose, onAdd, initialData }) => {
  const { t } = useLanguage();
  const [note, setNote] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
  });

  useEffect(() => {
    if (initialData) {
      setNote({
        title: initialData.title || "",
        content: initialData.content || "",
      });
    }
  }, [initialData]);

  // Quill 編輯器配置
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
    "blockquote",
    "code-block",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) {
      document.activeElement.blur();
    }
    if (note.title) {
      onAdd(note);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card"
        style={{
          width: "95%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2>{initialData ? t("editNote") || "編輯筆記" : t("addNote") || "新增筆記"}</h2>
          <button onClick={onClose} style={{ background: "none" }}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("noteTitle") || "標題"}</label>
            <div style={{ position: "relative" }}>
              <FileText size={20} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
              <input
                type="text"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
                placeholder={t("placeholderNoteTitle") || "例如：沖繩天氣資訊"}
                style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "2px solid #eee", fontSize: "1rem" }}
                required
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div style={{ marginBottom: "20px", flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("noteContent") || "內容"}</label>
            <div
              className="quill-container"
              style={{
                border: "2px solid #eee",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <ReactQuill
                theme="snow"
                value={note.content}
                onChange={(value) => setNote({ ...note, content: value })}
                modules={modules}
                formats={formats}
                placeholder={t("placeholderNoteContent") || "在這裡輸入筆記內容..."}
                style={{
                  minHeight: "250px",
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", borderRadius: "20px" }}>
            {t("saveNote") || "儲存筆記"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddNoteModal;
