import React from "react";
import { Trash2, Edit2, GripVertical } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableExpenseItem = ({ item, onDelete, onEdit, getCategoryIcon, t }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    padding: "15px",
    marginBottom: "10px",
    position: "relative",
    backgroundColor: "white",
    zIndex: transform ? 999 : "auto", // Ensure dragged item is on top
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div {...attributes} {...listeners} style={{ cursor: "grab", marginRight: "10px", color: "#ccc" }}>
        <GripVertical size={20} />
      </div>
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
      <button onClick={() => onEdit(item)} style={{ color: "#888", background: "none", padding: "5px", marginRight: "5px" }}>
        <Edit2 size={16} />
      </button>
      <button onClick={() => onDelete(item.id)} style={{ color: "#ff6b6b", background: "none", padding: "5px" }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const ExpenseList = ({ expenses, onDelete, onEdit, onReorder }) => {
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 400, // 需要長按 400ms 才觸發拖動
        tolerance: 8, // 長按時如果移動超過 8 像素就取消（變成滑動捲頁）
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event, date) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = grouped[date].findIndex((item) => item.id === active.id);
      const newIndex = grouped[date].findIndex((item) => item.id === over.id);
      const newItems = arrayMove(grouped[date], oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {sortedDates.map((date) => (
        <div key={date} style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.9rem", color: "#888", marginBottom: "10px", paddingLeft: "10px" }}>{date}</h3>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, date)}>
            <SortableContext items={grouped[date].map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {grouped[date].map((item) => (
                <SortableExpenseItem key={item.id} item={item} onDelete={onDelete} onEdit={onEdit} getCategoryIcon={getCategoryIcon} t={t} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
