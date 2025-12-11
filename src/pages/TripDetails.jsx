import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { ArrowLeft, Map, DollarSign, CheckSquare, FileText, Plus, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddItemModal from "../components/AddItemModal";
import DayView from "../components/DayView";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseList from "../components/ExpenseList";
import AddExpenseModal from "../components/AddExpenseModal";
import PayerManagerModal from "../components/PayerManagerModal";
import ShareModal from "../components/ShareModal";

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, addTripItem, updateTripItem, addExpense, updateExpense, reorderExpenses, deleteExpense, addPayer, deletePayer, renamePayer } =
    useTrips();
  const { t } = useLanguage();
  const trip = trips.find((t) => t.id === tripId);

  const [activeTab, setActiveTab] = useState("itinerary"); // itinerary, expenses, checklist, notes
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const dayTabsRef = useRef(null);
  const dayButtonRefs = useRef([]);

  // Auto-scroll day tabs when currentDayIndex changes
  useEffect(() => {
    if (dayButtonRefs.current[currentDayIndex] && dayTabsRef.current) {
      const button = dayButtonRefs.current[currentDayIndex];
      const container = dayTabsRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      // Calculate the ideal scroll position to center the button
      const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth"
      });
    }
  }, [currentDayIndex]);

  if (!trip) return <div>{t("tripNotFound")}</div>;

  const handleSaveItem = (item) => {
    if (!trip.days || trip.days.length === 0) return;
    const dayId = trip.days[currentDayIndex].id;
    if (editingItem) {
      updateTripItem(trip.id, dayId, editingItem.id, item);
    } else {
      addTripItem(trip.id, dayId, item);
    }
    setEditingItem(null);
  };

  const handleSaveExpense = (expense) => {
    if (editingExpense) {
      updateExpense(trip.id, editingExpense.id, expense);
      setEditingExpense(null);
    } else {
      addExpense(trip.id, expense);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "itinerary":
        if (!trip.days || trip.days.length === 0) {
          return (
            <div className="flex-center" style={{ height: "200px" }}>
              {t("noDaysAvailable")}
            </div>
          );
        }
        return (
          <div style={{ overflow: "visible", touchAction: "pan-y", minHeight: "60vh" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDayIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    if (currentDayIndex < trip.days.length - 1) setCurrentDayIndex(currentDayIndex + 1);
                  } else if (swipe > 10000) {
                    if (currentDayIndex > 0) setCurrentDayIndex(currentDayIndex - 1);
                  }
                }}
                style={{ touchAction: "none", minHeight: "60vh" }}
              >
                {trip.days[currentDayIndex] && (
                  <DayView
                    tripId={trip.id}
                    day={trip.days[currentDayIndex]}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowAddModal(true);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      case "expenses":
        return (
          <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingBottom: "80px" }}>
            <ExpenseSummary expenses={trip.expenses || []} payers={(trip.payers || []).map((p) => p.name)} />
            <ExpenseList
              expenses={trip.expenses || []}
              onDelete={(id) => deleteExpense(trip.id, id)}
              onEdit={(expense) => {
                setEditingExpense(expense);
                setShowExpenseModal(true);
              }}
              onReorder={(newExpenses) => reorderExpenses(trip.id, newExpenses)}
            />
          </div>
        );
      case "checklist":
        return (
          <div className="flex-center" style={{ height: "100%" }}>
            {t("checklist")} - {t("comingSoon")}
          </div>
        );
      case "notes":
        return (
          <div className="flex-center" style={{ height: "100%" }}>
            {t("notes")} - {t("comingSoon")}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "20px", paddingTop: "80px", paddingBottom: "100px" }}>
      {/* Top Navigation Bar - same as Home */}
      <div className="top-nav-bar">
        <Link to="/" style={{ position: "absolute", left: "20px", display: "flex", alignItems: "center", color: "var(--color-text)" }}>
          <ArrowLeft />
        </Link>
        <h1 className="chiikawa-header" style={{ fontSize: "1.2rem", margin: 0 }}>
          {trip.title}
        </h1>
        <button
          onClick={() => setShowShareModal(true)}
          style={{
            position: "absolute",
            right: "20px",
            background: "none",
            color: "var(--color-text)",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title={t("share")}
        >
          <Users size={20} />
          {trip.shares && trip.shares.length > 0 && (
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "#FFB7C5",
                color: "#4A3B32",
                borderRadius: "10px",
                padding: "2px 6px",
                fontWeight: "bold",
              }}
            >
              {trip.shares.length}
            </span>
          )}
        </button>
      </div>

      {/* Day Tabs */}
      {activeTab === "itinerary" && trip.days && trip.days.length > 0 && (
        <div
          ref={dayTabsRef}
          style={{
            display: "flex",
            overflowX: "auto",
            marginBottom: "10px",
            gap: "10px",
            scrollbarWidth: "none",
          }}
        >
          {trip.days.map((day, index) => (
            <button
              key={day.id}
              ref={(el) => (dayButtonRefs.current[index] = el)}
              onClick={() => setCurrentDayIndex(index)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor: currentDayIndex === index ? "var(--color-primary)" : "var(--color-white)",
                color: currentDayIndex === index ? "white" : "var(--color-text)",
                whiteSpace: "nowrap",
                boxShadow: "var(--shadow-soft)",
                fontWeight: "bold",
                flexShrink: 0,
                border: "2px solid var(--border-color)",
              }}
            >
              {t("day")} {day.dayIndex} {t("daySuffix")}
              <span style={{ fontSize: "0.8em", marginLeft: "5px", fontWeight: "normal" }}>{day.date.slice(5)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{ minHeight: "60vh" }}>
        {renderContent()}
      </div>

      {/* Bottom Nav - same as Home */}
      <div className="nav-bar">
        <NavButton icon={<Map size={20} />} label={t("itinerary")} active={activeTab === "itinerary"} onClick={() => setActiveTab("itinerary")} />
        <NavButton icon={<DollarSign size={20} />} label={t("expenses")} active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />

        {/* Center Add Button */}
        <div style={{ position: "relative", top: "-25px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFB7C5",
              border: "3px solid #4A3B32",
              boxShadow: "0 4px 0 rgba(74, 59, 50, 0.2)",
            }}
            onClick={() => {
              if (activeTab === "expenses") {
                setEditingExpense(null);
                setShowExpenseModal(true);
              } else {
                setEditingItem(null);
                setShowAddModal(true);
              }
            }}
          >
            <Plus size={32} strokeWidth={3} />
          </motion.button>
        </div>

        <NavButton
          icon={<CheckSquare size={20} />}
          label={t("checklist")}
          active={activeTab === "checklist"}
          onClick={() => setActiveTab("checklist")}
        />
        <NavButton icon={<FileText size={20} />} label={t("notes")} active={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onAdd={handleSaveItem}
          initialData={editingItem}
        />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          onAdd={handleSaveExpense}
          payers={(trip.payers || []).map((p) => p.name)}
          onManagePayers={() => setShowPayerModal(true)}
          initialData={editingExpense}
        />
      )}

      {showPayerModal && (
        <PayerManagerModal
          onClose={() => setShowPayerModal(false)}
          payers={(trip.payers || []).map((p) => p.name)}
          onAdd={(name) => addPayer(trip.id, name)}
          onDelete={(name) => deletePayer(trip.id, name)}
          onRename={(oldName, newName) => renamePayer(trip.id, oldName, newName)}
        />
      )}

      {showShareModal && <ShareModal tripId={trip.id} onClose={() => setShowShareModal(false)} />}
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      color: active ? "var(--color-primary)" : "var(--color-text-light)",
      background: "none",
    }}
  >
    {icon}
    <span style={{ fontSize: "0.7rem" }}>{label}</span>
  </button>
);

export default TripDetails;
