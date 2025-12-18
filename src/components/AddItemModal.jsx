import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const AddItemModal = ({ onClose, onAdd, initialData }) => {
  const { t } = useLanguage();
  const [item, setItem] = useState(() => {
    if (initialData) {
      const [start, end] = initialData.time ? initialData.time.split(" - ") : ["", ""];
      return {
        title: initialData.title || "",
        startTime: start || "",
        endTime: end || "",
        note: initialData.description || "",
        image: initialData.image || "",
      };
    }
    return {
      title: "",
      startTime: "",
      endTime: "",
      note: "",
      image: "",
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Blur active element to reset iOS Safari zoom
    if (document.activeElement) {
      document.activeElement.blur();
    }
    if (item.title) {
      onAdd({
        ...item,
        time: item.startTime || item.endTime ? `${item.startTime} - ${item.endTime}` : "",
      });
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
        style={{ width: "90%", maxWidth: "400px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{initialData ? t("editActivity") || "Edit Activity" : t("addActivity")}</h2>
          <button onClick={onClose} style={{ background: "none" }}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("title")}</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              placeholder={t("placeholderActivity")}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("startTime")}</label>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) => setItem({ ...item, startTime: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("endTime")}</label>
              <input
                type="time"
                value={item.endTime}
                onChange={(e) => setItem({ ...item, endTime: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("notes")}</label>
            <textarea
              value={item.note}
              onChange={(e) => setItem({ ...item, note: e.target.value })}
              placeholder={t("placeholderNote")}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "80px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("imageURL")}</label>
            <input
              type="url"
              value={item.image}
              onChange={(e) => setItem({ ...item, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", borderRadius: "20px" }}>
            {initialData ? t("saveChanges") || "Save Changes" : t("addToItinerary")}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddItemModal;
