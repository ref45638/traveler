import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { ArrowLeft, Map, DollarSign, CheckSquare, FileText, Plus, Users } from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import AddItemModal from "../components/AddItemModal";
import DayView from "../components/DayView";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseList from "../components/ExpenseList";
import AddExpenseModal from "../components/AddExpenseModal";
import PayerManagerModal from "../components/PayerManagerModal";
import ShareModal from "../components/ShareModal";
import Checklist from "../components/Checklist";

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, addTripItem, updateTripItem, addExpense, updateExpense, reorderExpenses, deleteExpense, addPayer, deletePayer, renamePayer, addChecklistItem, toggleChecklistItem, deleteChecklistItem } =
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
  const dayTabsInnerRef = useRef(null);
  const dayButtonRefs = useRef([]);
  const carouselContainerRef = useRef(null);
  const [slideWidth, setSlideWidth] = useState(375);
  const [dayTabsConstraints, setDayTabsConstraints] = useState({ left: 0, right: 0 });
  const carouselControls = useAnimationControls();

  // Calculate drag constraints for day tabs
  useEffect(() => {
    const updateDayTabsConstraints = () => {
      if (dayTabsRef.current && dayTabsInnerRef.current) {
        const containerWidth = dayTabsRef.current.offsetWidth;
        const innerWidth = dayTabsInnerRef.current.scrollWidth;
        const maxDrag = Math.max(0, innerWidth - containerWidth);
        setDayTabsConstraints({ left: -maxDrag, right: 0 });
      }
    };
    updateDayTabsConstraints();
    window.addEventListener("resize", updateDayTabsConstraints);
    return () => window.removeEventListener("resize", updateDayTabsConstraints);
  }, [trip?.days?.length, activeTab]);

  // Update slideWidth when container size changes
  useEffect(() => {
    const updateWidth = () => {
      if (carouselContainerRef.current) {
        setSlideWidth(carouselContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [activeTab]);

  // 同步動畫位置
  useEffect(() => {
    carouselControls.start({
      x: -currentDayIndex * slideWidth,
      transition: { type: "spring", stiffness: 400, damping: 40 },
    });
  }, [currentDayIndex, slideWidth, carouselControls]);

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
          <div ref={carouselContainerRef} style={{ overflow: "hidden", minHeight: "60vh" }}>
            <motion.div
              style={{
                display: "flex",
                width: `${trip.days.length * 100}%`,
              }}
              drag="x"
              dragConstraints={{
                left: -(trip.days.length - 1) * slideWidth,
                right: 0,
              }}
              dragElastic={0.1}
              dragMomentum={false}
              animate={carouselControls}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = slideWidth * 0.2;
                const velocityThreshold = 300;
                const swipeDistance = offset.x;
                const swipeVelocity = velocity.x;

                let newIndex = currentDayIndex;

                // 向左滑（下一天）
                if ((swipeDistance < -swipeThreshold || swipeVelocity < -velocityThreshold) && currentDayIndex < trip.days.length - 1) {
                  newIndex = currentDayIndex + 1;
                }
                // 向右滑（上一天）
                else if ((swipeDistance > swipeThreshold || swipeVelocity > velocityThreshold) && currentDayIndex > 0) {
                  newIndex = currentDayIndex - 1;
                }

                // 更新 index 並強制動畫到正確位置
                setCurrentDayIndex(newIndex);
                carouselControls.start({
                  x: -newIndex * slideWidth,
                  transition: { type: "spring", stiffness: 400, damping: 40 },
                });
              }}
            >
              {trip.days.map((day, index) => (
                <div
                  key={day.id}
                  style={{
                    width: `${100 / trip.days.length}%`,
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <DayView
                    tripId={trip.id}
                    day={day}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowAddModal(true);
                    }}
                  />
                </div>
              ))}
            </motion.div>
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
          <Checklist
            items={trip.checklist || []}
            onAdd={(text) => addChecklistItem(trip.id, text)}
            onToggle={(id, completed) => toggleChecklistItem(trip.id, id, completed)}
            onDelete={(id) => deleteChecklistItem(trip.id, id)}
          />
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

      {/* Day Tabs - Swipeable */}
      {activeTab === "itinerary" && trip.days && trip.days.length > 0 && (
        <div
          ref={dayTabsRef}
          style={{
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          <motion.div
            ref={dayTabsInnerRef}
            style={{
              display: "flex",
              gap: "10px",
              cursor: "grab",
              paddingRight: "20px",
            }}
            drag="x"
            dragConstraints={dayTabsConstraints}
            dragElastic={0.2}
            dragMomentum={true}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            whileDrag={{ cursor: "grabbing" }}
          >
            {trip.days.map((day, index) => (
              <motion.button
                key={day.id}
                ref={(el) => (dayButtonRefs.current[index] = el)}
                onClick={() => setCurrentDayIndex(index)}
                whileTap={{ scale: 0.95 }}
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
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ minHeight: "60vh" }}>{renderContent()}</div>

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
