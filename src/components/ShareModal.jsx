import React, { useState } from "react";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { X, Mail, Link2, Users, Trash2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ShareModal = ({ tripId, onClose }) => {
    const { trips, shareTrip, createInviteLink, removeSharedUser } = useTrips();
    const { t } = useLanguage();
    const trip = trips.find((t) => t.id === tripId);

    const [email, setEmail] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [copied, setCopied] = useState(false);

    if (!trip) return null;

    const handleShareByEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const result = await shareTrip(tripId, email, "editor");

        if (result.success) {
            setSuccess(`已成功分享給 ${email}`);
            setEmail("");
        } else {
            setError(result.error || "分享失敗");
        }

        setLoading(false);
    };

    const handleCreateInviteLink = async () => {
        setLoading(true);
        setError("");

        const result = await createInviteLink(tripId, "editor", 7);

        if (result.success) {
            setInviteCode(result.inviteCode);
        } else {
            setError(result.error || "建立邀請連結失敗");
        }

        setLoading(false);
    };

    const handleCopyLink = () => {
        const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}invite/${inviteCode}`;
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveUser = async (userId) => {
        if (confirm("確定要移除此使用者的分享權限嗎？")) {
            await removeSharedUser(tripId, userId);
        }
    };

    const getInviteUrl = () => {
        return `${window.location.origin}${import.meta.env.BASE_URL}invite/${inviteCode}`;
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
                zIndex: 2000,
                padding: "20px",
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflow: "auto",
                    backgroundColor: "#FFF",
                    position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 className="chiikawa-header" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <Users size={24} />
                        {t("shareTrip")}
                    </h2>
                    <button onClick={onClose} style={{ background: "none", padding: "5px" }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Owner/Editor Status */}
                <div
                    style={{
                        backgroundColor: trip.isOwner ? "#FFE5E5" : "#E5F5FF",
                        padding: "10px 15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                >
                    {trip.isOwner ? t("youAreOwner") : t("youAreEditor")}
                </div>

                {/* Only show sharing options to owners */}
                {trip.isOwner && (
                    <>
                        {/* Share by Email Section */}
                        <div style={{ marginBottom: "25px" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Mail size={18} />
                                {t("shareViaEmail")}
                            </h3>
                            <form onSubmit={handleShareByEmail}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t("emailPlaceholder")}
                                        style={{ flex: 1 }}
                                        required
                                        disabled={loading}
                                    />
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "10px 20px", borderRadius: "20px" }}>
                                        {t("share")}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Share by Link Section */}
                        <div style={{ marginBottom: "25px" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Link2 size={18} />
                                {t("shareViaLink")}
                            </h3>
                            {!inviteCode ? (
                                <button
                                    onClick={handleCreateInviteLink}
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ width: "100%", padding: "10px", borderRadius: "20px" }}
                                >
                                    {t("createInvite")}
                                </button>
                            ) : (
                                <div>
                                    <div
                                        style={{
                                            backgroundColor: "#f5f5f5",
                                            padding: "12px",
                                            borderRadius: "10px",
                                            marginBottom: "10px",
                                            fontSize: "0.85rem",
                                            wordBreak: "break-all",
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {getInviteUrl()}
                                    </div>
                                    <button
                                        onClick={handleCopyLink}
                                        className="btn-primary"
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            borderRadius: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            backgroundColor: copied ? "#4CAF50" : undefined,
                                        }}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                        {copied ? t("linkCopied") : t("copyLink")}
                                    </button>
                                    <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "8px", textAlign: "center" }}>
                                        {t("inviteExpires").replace("{days}", "7")}
                                    </p>
                                </div>
                            )}
                        </div>

                        <hr style={{ margin: "25px 0", border: "none", borderTop: "1px solid #eee" }} />
                    </>
                )}

                {/* Shared Users List */}
                <div>
                    <h3 style={{ fontSize: "1rem", marginBottom: "15px" }}>{t("sharedWith")}</h3>
                    {trip.shares && trip.shares.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {trip.shares.map((share) => (
                                <div
                                    key={share.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px",
                                        backgroundColor: "#f9f9f9",
                                        borderRadius: "10px",
                                        border: "1px solid #eee",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                                            {share.profiles?.full_name || share.profiles?.email || "Unknown User"}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "#666" }}>{share.profiles?.email}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>
                                            {t("editor")} · {new Date(share.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {trip.isOwner && (
                                        <button
                                            onClick={() => handleRemoveUser(share.user_id)}
                                            style={{
                                                background: "none",
                                                color: "#ff6b6b",
                                                padding: "8px",
                                            }}
                                            title={t("removeUser")}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>{t("noSharedUsers")}</p>
                    )}
                </div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                marginTop: "15px",
                                padding: "12px",
                                backgroundColor: "#ffe5e5",
                                color: "#d32f2f",
                                borderRadius: "10px",
                                fontSize: "0.9rem",
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                marginTop: "15px",
                                padding: "12px",
                                backgroundColor: "#e5f5e5",
                                color: "#2e7d32",
                                borderRadius: "10px",
                                fontSize: "0.9rem",
                            }}
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ShareModal;
