import React from "react";
import { Trash2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const ExpenseList = ({ expenses, onDelete }) => {
  const { t } = useLanguage();

  if (!expenses || expenses.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text)" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "5px" }}>{t("noExpenses")}</p>
        <p style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-light)" }}>{t("tapToAddExpense")}</p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const getCategoryIcon = (id) => {
    const icons = {
      flight: "✈️",
      food: "🍔",
      transport: "🚆",
      shopping: "🛍️",
      hotel: "🏨",
      ticket: "🎫",
      other: "✨",
    };
    return icons[id] || "✨";
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {sortedDates.map((date) => (
        <div key={date} style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "#888", marginBottom: "10px", paddingLeft: "10px" }}>{date}</h3>
          {grouped[date].map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px",
                marginBottom: "10px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  marginRight: "15px",
                }}
              >
                {getCategoryIcon(item.category)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{item.title}</div>
                {item.note && <div style={{ fontSize: "0.8rem", color: "#888" }}>{item.note}</div>}
                <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      backgroundColor: "#e3f2fd",
                      color: "#1565c0",
                      padding: "2px 8px",
                      borderRadius: "10px",
                    }}
                  >
                    {t("paidBy").replace("{name}", item.payer)}
                  </span>
                  {item.splitBy && item.splitBy.length > 0 && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        backgroundColor: "#f3e5f5",
                        color: "#7b1fa2",
                        padding: "2px 8px",
                        borderRadius: "10px",
                      }}
                    >
                      {t("forPeople").replace("{n}", item.splitBy.length)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginRight: "10px" }}>${item.amount.toFixed(2)}</div>
              <button onClick={() => onDelete(item.id)} style={{ color: "#ff6b6b", background: "none", padding: "5px" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
