import React from "react";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTrips } from "../context/TripContext";
import { useLanguage } from "../context/LanguageContext";
import { SortableItem } from "./SortableItem";
import { getAssetUrl } from "../utils/imagePath";

const DayView = ({ tripId, day, onEdit }) => {
  const { updateTripItems, deleteTripItem } = useTrips();
  const { t } = useLanguage();

  if (!day) return null;

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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = day.items.findIndex((item) => item.id === active.id);
      const newIndex = day.items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(day.items, oldIndex, newIndex);
      updateTripItems(tripId, day.id, newItems);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={day.items} strategy={verticalListSortingStrategy}>
          {day.items.map((item) => (
            <SortableItem key={item.id} id={item.id} item={item} onDelete={(id) => deleteTripItem(tripId, day.id, id)} onEdit={onEdit} />
          ))}
        </SortableContext>
      </DndContext>

      {day.items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--color-text)", // Darker text
            backgroundColor: "rgba(255,255,255,0.8)", // Less transparent background
            borderRadius: "20px",
            border: "2px dashed var(--color-primary)", // Colored border
            boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
          }}
        >
          <img src={getAssetUrl("/images/No_Activities.png")} alt="No activities" style={{ width: "150px", opacity: 1, marginBottom: "15px" }} />
          <p style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "5px" }}>{t("noActivities")}</p>
          <p style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-light)" }}>{t("tapToAdd")}</p>
        </div>
      )}
    </div>
  );
};

export default DayView;
