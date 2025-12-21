import React, { useState } from "react";
import { getAssetUrl } from "../utils/imagePath";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { Plus, Calendar, Trash2, Settings, MapPin, PawPrint, Home as HomeIcon, User, Pencil } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const { trips, addTrip, updateTrip, deleteTrip } = useTrips();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null); // null = new trip, trip object = editing
  const [newTrip, setNewTrip] = useState({ title: "", startDate: "", endDate: "", location: "" });

  const cardColors = ["var(--card-bg-pink)", "var(--card-bg-blue)", "var(--card-bg-yellow)", "var(--card-bg-green)"];

  // Location to Image Mapping
  // Location to Image Mapping
  // Store raw paths without getAssetUrl - will be processed when displayed
  const locationImages = {
    tokyo: "/images/locations/tokyo.png",
    東京: "/images/locations/tokyo.png",
    osaka: "/images/locations/osaka.png",
    大阪: "/images/locations/osaka.png",
    kyoto: "/images/locations/kyoto.png",
    京都: "/images/locations/kyoto.png",
    fukuoka: "/images/locations/fukuoka.png",
    福岡: "/images/locations/fukuoka.png",
    nagoya: "/images/locations/nagoya.png",
    名古屋: "/images/locations/nagoya.png",
    paris: "/images/locations/paris.png",
    巴黎: "/images/locations/paris.png",
    london: "/images/locations/london.png",
    倫敦: "/images/locations/london.png",
    hawaii: "/images/locations/hawaii.png",
    夏威夷: "/images/locations/hawaii.png",
    seoul: "/images/locations/seoul.png",
    首爾: "/images/locations/seoul.png",
    korea: "/images/locations/seoul.png",
    韓國: "/images/locations/seoul.png",
    newyork: "/images/locations/newyork.png",
    紐約: "/images/locations/newyork.png",
    usa: "/images/locations/newyork.png",
    美國: "/images/locations/newyork.png",
    rome: "/images/locations/rome.png",
    羅馬: "/images/locations/rome.png",
    italy: "/images/locations/rome.png",
    義大利: "/images/locations/rome.png",
    spain: "/images/locations/spain.png",
    西班牙: "/images/locations/spain.png",
    brazil: "/images/locations/brazil.png",
    巴西: "/images/locations/brazil.png",
    egypt: "/images/locations/egypt.png",
    埃及: "/images/locations/egypt.png",
    greece: "/images/locations/greece.png",
    希臘: "/images/locations/greece.png",
    sydney: "/images/locations/sydney.png",
    雪梨: "/images/locations/sydney.png",
    australia: "/images/locations/sydney.png",
    澳洲: "/images/locations/sydney.png",
    thailand: "/images/locations/tailand.png",
    泰國: "/images/locations/tailand.png",
    bangkok: "/images/locations/tailand.png",
    曼谷: "/images/locations/tailand.png",
    uk: "/images/locations/london.png",
    英國: "/images/locations/london.png",
    france: "/images/locations/paris.png",
    法國: "/images/locations/paris.png",
    japan: "/images/locations/tokyo.png",
    日本: "/images/locations/tokyo.png",
  };

  const defaultImages = ["/images/home.png", "/images/locations/tokyo.png"];

  const handleAddTrip = (e) => {
    e.preventDefault();
    // Blur active element to reset iOS Safari zoom
    if (document.activeElement) {
      document.activeElement.blur();
    }
    if (newTrip.title && newTrip.startDate && newTrip.endDate) {
      let selectedImage = defaultImages[0]; // Default fallback

      if (newTrip.location) {
        const searchKey = newTrip.location.trim().toLowerCase();
        const match = Object.keys(locationImages).find((key) => searchKey.includes(key));
        if (match) {
          selectedImage = locationImages[match];
        } else {
          // Random default image if location not found
          selectedImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
        }
      }

      if (editingTrip) {
        // Edit mode: use existing image if location didn't change
        const finalImage = newTrip.location !== editingTrip.location ? selectedImage : editingTrip.image;
        updateTrip(editingTrip.id, newTrip.title, newTrip.startDate, newTrip.endDate, newTrip.location, finalImage);
      } else {
        // Add mode
        addTrip(newTrip.title, newTrip.startDate, newTrip.endDate, newTrip.location, selectedImage);
      }

      setShowModal(false);
      setEditingTrip(null);
      setNewTrip({ title: "", startDate: "", endDate: "", location: "" });
    }
  };

  const handleEditTrip = (trip, e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTrip(trip);
    setNewTrip({
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      location: trip.location || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setNewTrip({ title: "", startDate: "", endDate: "", location: "" });
  };

  return (
    <div style={{ padding: "20px", paddingTop: "80px", paddingBottom: "100px" }}>
      {/* Top Navigation Bar */}
      <div className="top-nav-bar">
        <Link to="/" style={{ position: "absolute", left: "20px", display: "flex", alignItems: "center" }}>
          <img src={getAssetUrl("/images/home.png")} alt="Home" style={{ height: "40px", width: "auto" }} />
        </Link>
        <h1 className="chiikawa-header" style={{ fontSize: "1.5rem", margin: 0 }}>
          {t("appTitle")}
        </h1>
        <Link to="/settings" style={{ position: "absolute", right: "20px", color: "var(--color-text)" }}>
          <div className="btn-icon" style={{ width: "36px", height: "36px" }}>
            <Settings size={20} />
          </div>
        </Link>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {trips.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <img src={getAssetUrl("/images/No_Trips_Yet.png")} alt="No trips yet" style={{ width: "200px", opacity: 1, marginBottom: "20px" }} />
            <p style={{ color: "var(--color-text)", fontSize: "1.5rem", fontWeight: "900", marginBottom: "10px" }}>
              {t("noActivities") ? t("noActivities").replace("Activities", "Trips") : "No trips yet!"}
            </p>
            <p style={{ color: "var(--color-text)", fontSize: "1.2rem", fontWeight: "bold" }}>{t("tapToAdd")}</p>
          </div>
        ) : (
          trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{
                backgroundColor: cardColors[index % cardColors.length],
                padding: "12px",
                display: "flex",
                gap: "12px",
                position: "relative",
              }}
            >
              <Link
                to={`/trip/${trip.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "flex", width: "100%", alignItems: "stretch", gap: "16px" }}
              >
                {/* Left Image Area */}
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    flexShrink: 0,
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <img
                    src={getAssetUrl(trip.image) || getAssetUrl("/images/tokyo.png")}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt="Trip"
                  />
                </div>

                {/* Right Content Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", marginBottom: "6px", fontWeight: "800", lineHeight: "1.2" }}>{trip.title}</h2>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--color-text)",
                        marginBottom: "4px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      <MapPin size={14} />
                      <span>{trip.location || "Japan (Demo)"}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--color-text)",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      <Calendar size={14} />
                      <span>
                        {trip.startDate} ~ {trip.endDate.slice(5)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      alignSelf: "flex-end",
                      backgroundColor: "#FFF8E7",
                      border: "2px solid var(--border-color)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "1px 1px 0 rgba(74, 59, 50, 0.2)",
                    }}
                  >
                    View Details <PawPrint size={14} />
                  </div>
                </div>
              </Link>

              {/* Edit and Delete buttons */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  display: "flex",
                  gap: "5px",
                }}
              >
                <button
                  onClick={(e) => handleEditTrip(trip, e)}
                  style={{
                    color: "var(--color-text)",
                    background: "rgba(255,255,255,0.8)",
                    padding: "5px",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm(t("deleteConfirm"))) deleteTrip(trip.id);
                  }}
                  style={{
                    color: "#ff6b6b",
                    background: "rgba(255,255,255,0.8)",
                    padding: "5px",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bottom Nav with Add Button */}
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
            color: "var(--color-text)",
          }}
        >
          <img src={getAssetUrl("/images/house.png")} alt="Home" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{t("home")}</span>
        </Link>
        <div style={{ position: "relative", top: "-25px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFB7C5",
              border: "3px solid #4A3B32",
            }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={36} strokeWidth={3} />
          </motion.button>
        </div>
        <Link
          to="/profile"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            color: "var(--color-text)",
          }}
        >
          <User size={40} strokeWidth={2.5} />
          <span style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{t("profile")}</span>
        </Link>
      </div>

      {showModal && (
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
            style={{ width: "90%", maxWidth: "400px", backgroundColor: "#FFF" }}
          >
            <h2 className="chiikawa-header">{editingTrip ? t("editTrip") || "編輯旅程" : t("newTrip")}</h2>
            <form onSubmit={handleAddTrip}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("title")}</label>
                <input
                  type="text"
                  value={newTrip.title}
                  onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                  placeholder={t("placeholderTitle")}
                  style={{ width: "100%" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>地點</label>
                <input
                  type="text"
                  value={newTrip.location}
                  onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                  placeholder="e.g. Tokyo, Japan"
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("startDate")}</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                    style={{ width: "100%" }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{t("endDate")}</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                    style={{ width: "100%" }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ padding: "10px 20px", borderRadius: "20px", background: "#eee", border: "2px solid #4A3B32" }}
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "10px 20px", borderRadius: "20px" }}>
                  {editingTrip ? t("save") || "保存" : t("create")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;
