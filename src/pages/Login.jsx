import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("請檢查您的信箱以啟用帳號！");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-center"
      style={{
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
        // Background handled by body in index.css
      }}
    >
      <div
        className="login-container"
        style={{
          padding: "20px",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // No background, border, or shadow as requested
        }}
      >
        <h1
          className="chiikawa-header"
          style={{
            fontSize: "3rem", // Larger for impact
            marginBottom: "10px",
            color: "var(--color-text)",
            textShadow: "3px 3px 0 #fff", // Stronger outline for readability
          }}
        >
          {isSignUp ? "註冊帳號" : "Traveler"}
        </h1>
        <p
          style={{
            color: "var(--color-text)",
            marginBottom: "30px",
            fontSize: "1.2rem",
            fontWeight: "800",
            textShadow: "2px 2px 0 #fff",
          }}
        >
          {isSignUp ? "開始規劃您的下一趟旅程" : "歡迎回來，繼續您的冒險"}
        </p>

        <form
          onSubmit={handleAuth}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "var(--color-text)",
                fontWeight: "900",
                fontSize: "1.1rem",
                textShadow: "2px 2px 0 #fff",
              }}
            >
              電子郵件
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-sm)",
                border: "var(--border-width) solid var(--border-color)",
                fontSize: "1rem",
                backgroundColor: "var(--color-white)",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "var(--color-text)",
                fontWeight: "900",
                fontSize: "1.1rem",
                textShadow: "2px 2px 0 #fff",
              }}
            >
              密碼
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-sm)",
                border: "var(--border-width) solid var(--border-color)",
                fontSize: "1rem",
                backgroundColor: "var(--color-white)",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "16px",
              fontSize: "1.2rem",
              width: "100%",
              borderRadius: "50px", // Rounder button
              boxShadow: "var(--shadow-soft)",
            }}
          >
            {loading ? "處理中..." : isSignUp ? "註冊" : "登入"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: message.includes("檢查") ? "var(--card-bg-green)" : "#ffebee",
              color: "var(--color-text)",
              fontSize: "0.9rem",
              textAlign: "center",
              width: "100%",
              border: "2px solid var(--border-color)",
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <span
            style={{
              color: "var(--color-text)",
              fontWeight: "bold",
              textShadow: "2px 2px 0 #fff",
            }}
          >
            {isSignUp ? "已有帳號？" : "還沒有帳號？"}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary-dark)",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "800",
              marginLeft: "5px",
              textDecoration: "underline",
            }}
          >
            {isSignUp ? "登入" : "註冊"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
