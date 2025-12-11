import React from "react";
import { useLanguage } from "../context/LanguageContext";

const ExpenseSummary = ({ expenses, payers }) => {
  const { t } = useLanguage();
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Calculate Payer Stats
  const payerStats = {};
  payers.forEach((p) => (payerStats[p] = 0));
  expenses.forEach((item) => {
    if (payerStats[item.payer] !== undefined) {
      payerStats[item.payer] += item.amount;
    } else {
      payerStats[item.payer] = item.amount; // Handle new payers
    }
  });

  // Calculate Balances (Simplified: Total Paid - Fair Share)
  // Fair Share = Total Spent / Number of Payers (Assuming equal split for simplicity for now, or based on splitBy if implemented fully)
  // For this version, we'll stick to "Who Paid What" as requested, and a simple "Net Balance" if possible.

  // Let's do a proper split calculation based on item.splitBy
  const balances = {};
  payers.forEach((p) => (balances[p] = 0));

  expenses.forEach((item) => {
    // Credit the payer
    balances[item.payer] = (balances[item.payer] || 0) + item.amount;

    // Debit the splitters
    const splitCount = item.splitBy ? item.splitBy.length : payers.length;
    const splitAmount = item.amount / splitCount;
    const splitPeople = item.splitBy && item.splitBy.length > 0 ? item.splitBy : payers;

    splitPeople.forEach((person) => {
      balances[person] = (balances[person] || 0) - splitAmount;
    });
  });

  return (
    <div style={{ padding: "0 10px 20px 10px" }}>
      {/* Total Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #FFB7C5 0%, #FFD1DC 100%)",
          color: "white",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0 4px 15px rgba(255, 183, 197, 0.4)",
        }}
      >
        <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "5px" }}>{t("totalSpent")}</div>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>${totalSpent.toFixed(2)}</div>
      </div>

      {/* Payer Stats */}
      {totalSpent > 0 && (
        <>
          <h3 style={{ fontSize: "1rem", marginBottom: "10px", color: "var(--color-text)" }}>{t("whoPaid")}</h3>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
            {Object.entries(payerStats).map(([name, amount]) => (
              <div
                key={name}
                className="card"
                style={{
                  minWidth: "120px",
                  padding: "15px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#1565c0",
                  }}
                >
                  {name.charAt(0)}
                </div>
                <div style={{ fontWeight: "bold" }}>{name}</div>
                <div style={{ color: "#888" }}>${amount.toFixed(0)}</div>
              </div>
            ))}
          </div>

          {/* Balances (Who owes who) */}
          <h3 style={{ fontSize: "1rem", marginTop: "10px", marginBottom: "10px", color: "var(--color-text)" }}>{t("balances")}</h3>
          <div className="card" style={{ padding: "15px" }}>
            {Object.entries(balances).map(([name, balance]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span>{name}</span>
                <span style={{ fontWeight: "bold", color: balance >= 0 ? "#4caf50" : "#ff6b6b" }}>
                  {balance >= 0 ? `${t("gets")} $${balance.toFixed(2)}` : `${t("owes")} $${Math.abs(balance).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseSummary;
