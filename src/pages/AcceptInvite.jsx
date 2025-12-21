import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { CheckCircle, XCircle, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { getAssetUrl } from "../utils/imagePath";

const AcceptInvite = () => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { user, acceptInvite } = useTrips();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tripInfo, setTripInfo] = useState(null);

    useEffect(() => {
        if (!user) {
            // Redirect to login if not logged in
            navigate("/login?redirect=/invite/" + inviteCode);
        }
    }, [user, navigate, inviteCode]);

    const handleAccept = async () => {
        setLoading(true);
        setError("");

        const result = await acceptInvite(inviteCode);

        if (result.success) {
            // Show success and redirect to the trip
            setTripInfo(result.trip);
            setTimeout(() => {
                navigate(`/trip/${result.trip.id}`);
            }, 2000);
        } else {
            setError(result.error || t("failedToAccept"));
        }

        setLoading(false);
    };

    const handleDecline = () => {
        navigate("/");
    };

    if (!user) {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                }}
            >
                <p>{t("pleaseLogin")}</p>
            </div>
        );
    }

    if (tripInfo) {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    backgroundColor: "#f5f5f5",
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card"
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        textAlign: "center",
                        backgroundColor: "#FFF",
                    }}
                >
                    <CheckCircle size={64} color="#4CAF50" style={{ margin: "0 auto 20px" }} />
                    <h2 className="chiikawa-header" style={{ marginBottom: "10px" }}>
                        {t("successJoin")}
                    </h2>
                    <p style={{ color: "#666" }}>{t("redirecting").replace("{title}", tripInfo.title)}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                backgroundColor: "#f5f5f5",
            }}
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    backgroundColor: "#FFF",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                    <img src={getAssetUrl("/images/home.png")} alt="Traveler" style={{ height: "60px", marginBottom: "15px" }} />
                    <h2 className="chiikawa-header">{t("acceptInvite")}</h2>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>{t("invitedToJoin")}</p>
                </div>

                {error ? (
                    <div>
                        <div
                            style={{
                                backgroundColor: "#ffe5e5",
                                color: "#d32f2f",
                                padding: "15px",
                                borderRadius: "10px",
                                marginBottom: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <XCircle size={24} />
                            <div>{error}</div>
                        </div>
                        <button
                            onClick={handleDecline}
                            className="btn-primary"
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "20px",
                            }}
                        >
                            {t("backHome")}
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                backgroundColor: "#f9f9f9",
                                padding: "20px",
                                borderRadius: "15px",
                                marginBottom: "25px",
                            }}
                        >
                            <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "8px" }}>{t("inviteCode")}</div>
                            <div
                                style={{
                                    fontSize: "0.9rem",
                                    fontFamily: "monospace",
                                    backgroundColor: "#fff",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #eee",
                                    wordBreak: "break-all",
                                }}
                            >
                                {inviteCode}
                            </div>
                        </div>

                        <p style={{ marginBottom: "20px", textAlign: "center", color: "#666" }}>{t("acceptInviteDesc").replace("{acceptInvite}", t("acceptInvite"))}</p>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={handleDecline}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "20px",
                                    background: "#eee",
                                    border: "2px solid #4A3B32",
                                    fontWeight: "bold",
                                }}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "20px",
                                }}
                            >
                                {loading ? t("processing") : t("acceptInvite")}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AcceptInvite;
