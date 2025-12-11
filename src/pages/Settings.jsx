import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { ArrowLeft, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ padding: "20px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <Link to="/" style={{ color: "var(--color-text)" }}>
          <ArrowLeft />
        </Link>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{t("settings")}</h1>
      </header>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--color-primary)" }}>
          <Globe />
          <h2 style={{ fontSize: "1.2rem" }}>{t("language")}</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => setLanguage("zh-TW")}
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "2px solid",
              borderColor: language === "zh-TW" ? "var(--color-primary)" : "transparent",
              backgroundColor: language === "zh-TW" ? "var(--color-bg)" : "#f5f5f5",
              color: "var(--color-text)",
              textAlign: "left",
              fontWeight: language === "zh-TW" ? "bold" : "normal",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            繁體中文
            {language === "zh-TW" && <span style={{ color: "var(--color-primary)" }}>✓</span>}
          </button>

          <button
            onClick={() => setLanguage("en")}
            style={{
              padding: "15px",
              borderRadius: "12px",
              border: "2px solid",
              borderColor: language === "en" ? "var(--color-primary)" : "transparent",
              backgroundColor: language === "en" ? "var(--color-bg)" : "#f5f5f5",
              color: "var(--color-text)",
              textAlign: "left",
              fontWeight: language === "en" ? "bold" : "normal",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            English
            {language === "en" && <span style={{ color: "var(--color-primary)" }}>✓</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
