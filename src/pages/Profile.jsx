import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getAssetUrl } from "../utils/imagePath";
import { User, LogOut, Trash2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("確定要刪除帳號嗎？此動作無法復原！")) {
      setLoading(true);
      try {
        const { error } = await supabase.rpc("delete_user");
        if (error) throw error;
        await supabase.auth.signOut();
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("刪除帳號失敗，請稍後再試。");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-container" style={{ padding: "20px", paddingTop: "40px" }}>
      <h1 className="chiikawa-header" style={{ fontSize: "2rem", marginBottom: "30px" }}>
        {t("profile")}
      </h1>

      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={30} color="#888" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "bold", wordBreak: "break-all" }}>{userEmail || "User"}</h2>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Traveler</p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f8f9fa",
            color: "var(--color-text)",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          <LogOut size={20} />
          登出
        </button>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            fontSize: "1rem",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Trash2 size={20} />
          {loading ? "刪除中..." : "刪除帳號"}
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="nav-bar">
        <Link
          to="/"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            color: "var(--color-text-light)",
          }}
        >
          <img src={getAssetUrl("/images/house.png")} alt="Home" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{t("home")}</span>
        </Link>
        <div style={{ width: "70px" }}></div> {/* Spacer for FAB */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--color-primary)" }}
        >
          <User size={40} strokeWidth={2.5} />
          <span style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{t("profile")}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
