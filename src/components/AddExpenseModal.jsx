import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, DollarSign, User, Tag, Calendar, Settings } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const AddExpenseModal = ({ onClose, onAdd, payers = [], onManagePayers, initialData }) => {
  const { t } = useLanguage();
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    category: "",
    payer: payers.length > 0 ? payers[0] : "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setExpense({
        title: initialData.title,
        amount: initialData.amount,
        category: initialData.category,
        payer: initialData.payer,
        date: initialData.date,
        note: initialData.note || "",
      });
    }
  }, [initialData]);

  // Update payer if payers list changes (e.g. after managing payers)
  useEffect(() => {
    if (payers.length > 0 && !expense.payer && !initialData) {
      setExpense((prev) => ({ ...prev, payer: payers[0] }));
    }
  }, [payers, initialData]);

  const categories = [
    { id: "flight", icon: "✈️", label: t("cat_flight"), color: "#BDE0FE" },
    { id: "hotel", icon: "🏨", label: t("cat_hotel"), color: "#CAFFBF" },
    { id: "transport", icon: "🚆", label: t("cat_transport"), color: "#A0C4FF" },
    { id: "food", icon: "🍔", label: t("cat_food"), color: "#FFB7C5" },
    { id: "shopping", icon: "🛍️", label: t("cat_shopping"), color: "#FDFFB6" },
    { id: "ticket", icon: "🎫", label: t("cat_ticket"), color: "#BDB2FF" },
    { id: "other", icon: "✨", label: t("cat_other"), color: "#FFC6FF" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.category) {
      setError(t("selectCategory") || "Please select a category");
      return;
    }
    if (expense.title && expense.amount && expense.payer) {
      onAdd({
        ...expense,
        amount: parseFloat(expense.amount),
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
          <h2>{initialData ? t("editExpense") || "Edit Expense" : t("addExpense")}</h2>
          <button onClick={onClose} style={{ background: "none" }}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("amount")}</label>
            <div style={{ position: "relative" }}>
              <DollarSign size={20} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
              <input
                type="number"
                value={expense.amount}
                onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                placeholder="0.00"
                style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "2px solid #eee", fontSize: "1.2rem" }}
                required
              />
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("title")}</label>
            <input
              type="text"
              value={expense.title}
              onChange={(e) => setExpense({ ...expense, title: e.target.value })}
              placeholder={t("placeholderActivity")}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
              required
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontWeight: "bold", color: error ? "#ff6b6b" : "inherit" }}>
                {t("category")} {error && <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>({error})</span>}
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                paddingBottom: "5px",
                padding: "5px",
                border: error ? "2px solid #ff6b6b" : "none",
                borderRadius: "12px",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setExpense({ ...expense, category: cat.id });
                    setError("");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "20px",
                    border: expense.category === cat.id ? `2px solid ${cat.color}` : "1px solid #eee",
                    backgroundColor: expense.category === cat.id ? cat.color : "white",
                    whiteSpace: "nowrap",
                    opacity: expense.category === cat.id ? 1 : 0.7,
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payer */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontWeight: "bold" }}>{t("whoPaidLabel")}</label>
              <button
                type="button"
                onClick={onManagePayers}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-primary)",
                  background: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Settings size={14} /> {t("managePayers")}
              </button>
            </div>

            {payers.length === 0 ? (
              <div
                onClick={onManagePayers}
                style={{
                  padding: "15px",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                {t("noPayersTapToAdd")}
              </div>
            ) : (
              <select
                value={expense.payer}
                onChange={(e) => setExpense({ ...expense, payer: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                required
              >
                <option value="" disabled>
                  {t("selectPayer")}
                </option>
                {payers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("notes")}</label>
            <textarea
              value={expense.note}
              onChange={(e) => setExpense({ ...expense, note: e.target.value })}
              placeholder={t("placeholderNote")}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "60px" }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", borderRadius: "20px" }}>
            {t("saveExpense")}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;
