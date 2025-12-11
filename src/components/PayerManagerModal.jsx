import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Edit2, Check, Plus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const PayerManagerModal = ({ onClose, payers, onAdd, onDelete, onRename }) => {
  const { t } = useLanguage();
  const [newPayerName, setNewPayerName] = useState("");
  const [editingPayer, setEditingPayer] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (newPayerName.trim()) {
      onAdd(newPayerName.trim());
      setNewPayerName("");
    }
  };

  const startEdit = (payer) => {
    setEditingPayer(payer);
    setEditName(payer);
  };

  const saveEdit = () => {
    if (editName.trim() && editName !== editingPayer) {
      onRename(editingPayer, editName.trim());
    }
    setEditingPayer(null);
    setEditName("");
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
        zIndex: 1100, // Higher than AddExpenseModal if stacked, but usually separate
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card"
        style={{ width: "90%", maxWidth: "350px", maxHeight: "80vh", overflowY: "auto", padding: "20px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{t("managePayers")}</h2>
          <button onClick={onClose} style={{ background: "none", padding: "5px" }}>
            <X />
          </button>
        </div>

        {/* Add New Payer */}
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            value={newPayerName}
            onChange={(e) => setNewPayerName(e.target.value)}
            placeholder={t("enterName")}
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center" }}
            disabled={!newPayerName.trim()}
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Payer List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {payers.map((payer) => (
            <div
              key={payer}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            >
              {editingPayer === payer ? (
                <div style={{ display: "flex", gap: "5px", flex: 1 }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ flex: 1, padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    autoFocus
                  />
                  <button onClick={saveEdit} style={{ color: "#4caf50", background: "none" }}>
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontWeight: "bold" }}>{payer}</span>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={() => startEdit(payer)} style={{ color: "#888", background: "none" }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(payer)} style={{ color: "#ff6b6b", background: "none" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {payers.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: "20px" }}>{t("noPayersYet")}</div>}
        </div>
      </motion.div>
    </div>
  );
};

export default PayerManagerModal;
