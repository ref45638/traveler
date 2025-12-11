import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { eachDayOfInterval, format } from "date-fns";
import { supabase } from "../lib/supabaseClient";

const TripContext = createContext();

export const useTrips = () => useContext(TripContext);

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth & Initial Fetch
  useEffect(() => {
    // Check active session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchTrips(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Auth session check failed:", err);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTrips(session.user.id);
      } else {
        setTrips([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTrips = async (userId) => {
    try {
      // Don't set loading(true) here to avoid unmounting components during refresh
      // setLoading(true);
      const { data, error } = await supabase
        .from("trips")
        .select(
          `
          *,
          days:trip_days (
            *,
            items:trip_items (*)
          ),
          expenses (*),
          payers (*)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Sort days and items properly
      const formattedTrips = data.map((trip) => ({
        ...trip,
        startDate: trip.start_date,
        endDate: trip.end_date,
        image: trip.image_url,
        expenses: trip.expenses ? trip.expenses.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : [],
        days: trip.days
          .sort((a, b) => a.day_index - b.day_index)
          .map((day) => ({
            ...day,
            dayIndex: day.day_index,
            items: day.items ? day.items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : [],
          })),
      }));

      setTrips(formattedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTrip = async (title, startDate, endDate, location, image) => {
    if (!user) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = eachDayOfInterval({ start, end });

    try {
      // 1. Create Trip
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .insert([
          {
            user_id: user.id,
            title,
            start_date: startDate,
            end_date: endDate,
            location,
            image_url: image,
          },
        ])
        .select()
        .single();

      if (tripError) throw tripError;

      // 2. Create Days
      const daysData = dates.map((date, index) => ({
        trip_id: tripData.id,
        day_index: index + 1,
        date: format(date, "yyyy-MM-dd"),
      }));

      const { error: daysError } = await supabase.from("trip_days").insert(daysData);

      if (daysError) throw daysError;

      // Refresh trips
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  const deleteTrip = async (id) => {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
      setTrips(trips.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const addTripItem = async (tripId, dayId, item) => {
    try {
      const { error } = await supabase.from("trip_items").insert([
        {
          day_id: dayId,
          title: item.title,
          description: item.description,
          time: item.time,
          location: item.location,
          cost: item.cost,
          type: item.type,
          completed: false,
        },
      ]);

      if (error) throw error;
      fetchTrips(user.id); // Refetch to get updated structure
    } catch (error) {
      console.error("Error adding trip item:", error);
    }
  };

  const updateTripItem = async (tripId, dayId, itemId, updatedItem) => {
    try {
      const { error } = await supabase
        .from("trip_items")
        .update({
          title: updatedItem.title,
          description: updatedItem.description,
          time: updatedItem.time,
          location: updatedItem.location,
          cost: updatedItem.cost,
          type: updatedItem.type,
          completed: updatedItem.completed,
        })
        .eq("id", itemId);

      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error updating trip item:", error);
    }
  };

  const deleteTripItem = async (tripId, dayId, itemId) => {
    try {
      const { error } = await supabase.from("trip_items").delete().eq("id", itemId);
      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error deleting trip item:", error);
    }
  };

  const addExpense = async (tripId, expense) => {
    try {
      // Get current max order_index
      const trip = trips.find((t) => t.id === tripId);
      const currentExpenses = trip?.expenses || [];
      const maxOrder = currentExpenses.reduce((max, item) => Math.max(max, item.order_index || 0), 0);

      const { error } = await supabase.from("expenses").insert([
        {
          trip_id: tripId,
          title: expense.title,
          amount: expense.amount,
          payer: expense.payer,
          date: expense.date,
          category: expense.category,
          note: expense.note,
          order_index: maxOrder + 1,
        },
      ]);

      if (error) throw error;

      if (expense.payer) {
        const existingPayer = trip?.payers?.find((p) => p.name === expense.payer);
        if (!existingPayer) {
          await addPayer(tripId, expense.payer);
        }
      }

      fetchTrips(user.id);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const updateExpense = async (tripId, expenseId, updatedExpense) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          title: updatedExpense.title,
          amount: updatedExpense.amount,
          payer: updatedExpense.payer,
          date: updatedExpense.date,
          category: updatedExpense.category,
          note: updatedExpense.note,
        })
        .eq("id", expenseId);

      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const reorderExpenses = async (tripId, reorderedExpenses) => {
    // Optimistic Update
    setTrips((prevTrips) => {
      return prevTrips.map((trip) => {
        if (trip.id !== tripId) return trip;

        // Create a map of updated expenses for easy lookup
        // And assign the new order_index
        const updatedMap = new Map(reorderedExpenses.map((item, index) => [item.id, { ...item, order_index: index }]));

        // Merge with existing expenses
        // We iterate over existing expenses. If an expense is in the reordered list, we use the new version.
        // However, we must ensure the *order* in the state array reflects the new order for that day.
        // Since `reorderedExpenses` is only for ONE day, we can't just replace the whole array.

        // Strategy:
        // 1. Get all expenses that are NOT in the reordered list (other days).
        // 2. Combine with the reordered list.
        // 3. Sort everything by order_index (optional, but good for consistency if we rely on it).
        // Actually, since order_index is scoped per day effectively (0, 1, 2...), sorting by it globally mixes days.
        // But `ExpenseList` groups by date.
        // So as long as the array has the correct items, `ExpenseList` will group them.
        // BUT `ExpenseList` iterates the main array to build groups.
        // If the main array is [Day1_Item1, Day2_Item1, Day1_Item2], the groups will be correct.
        // The order WITHIN the group depends on the order they appear in the main array.

        // So we MUST ensure that for the specific day, the items appear in the correct relative order in the main array.
        // Or simpler: Just update the `order_index` properties and then sort the whole array by `order_index`.
        // Since we use `order_index` for sorting in `fetchTrips`, we should maintain that invariant.

        const newExpenses = trip.expenses.map((exp) => (updatedMap.has(exp.id) ? updatedMap.get(exp.id) : exp));

        // We sort by order_index to ensure the UI (which groups by date then preserves order) works.
        // Note: Since order_index is 0-based per day, sorting by it alone doesn't separate days.
        // But `ExpenseList` groups by date first.
        // So:
        // Day 1: A(0), B(1)
        // Day 2: C(0), D(1)
        // Sorted: A, C, B, D (stable sort or undefined order for equal keys).
        // Grouped Day 1: A, B.
        // Grouped Day 2: C, D.
        // This works.

        newExpenses.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

        return { ...trip, expenses: newExpenses };
      });
    });

    try {
      // For now, just update DB
      const updates = reorderedExpenses.map((item, index) => ({
        id: item.id,
        trip_id: tripId,
        title: item.title, // Required for upsert if not partial? No, upsert needs PK.
        amount: item.amount,
        payer: item.payer,
        date: item.date,
        category: item.category,
        note: item.note,
        order_index: index,
      }));

      const { error } = await supabase.from("expenses").upsert(updates);

      if (error) throw error;
      // fetchTrips(user.id); // We don't need to fetch if optimistic update worked. But maybe good for sync.
      // If we don't fetch, we save bandwidth/flicker.
    } catch (error) {
      console.error("Error reordering expenses:", error);
      fetchTrips(user.id); // Revert/Sync on error
    }
  };

  const deleteExpense = async (tripId, expenseId) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const addPayer = async (tripId, payerName) => {
    try {
      // Check for duplicates locally first to avoid DB error if unique constraint exists (or just let DB handle it)
      // Schema doesn't enforce unique name per trip yet, but it should logically.
      const { error } = await supabase.from("payers").insert([{ trip_id: tripId, name: payerName }]);

      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error adding payer:", error);
    }
  };

  const deletePayer = async (tripId, payerName) => {
    try {
      // We need to find the payer ID since the UI passes name.
      // Ideally UI should pass ID. But let's find it.
      const trip = trips.find((t) => t.id === tripId);
      const payer = trip?.payers?.find((p) => p.name === payerName);

      if (!payer) return;

      const { error } = await supabase.from("payers").delete().eq("id", payer.id);
      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error deleting payer:", error);
    }
  };

  const renamePayer = async (tripId, oldName, newName) => {
    try {
      const trip = trips.find((t) => t.id === tripId);
      const payer = trip?.payers?.find((p) => p.name === oldName);

      if (!payer) return;

      // 1. Update Payer Name
      const { error: payerError } = await supabase.from("payers").update({ name: newName }).eq("id", payer.id);

      if (payerError) throw payerError;

      // 2. Update Expenses with this payer
      // Since expenses store payer name as string (based on my schema design to match legacy),
      // we need to update them.
      const { error: expenseError } = await supabase.from("expenses").update({ payer: newName }).eq("trip_id", tripId).eq("payer", oldName);

      if (expenseError) throw expenseError;

      fetchTrips(user.id);
    } catch (error) {
      console.error("Error renaming payer:", error);
    }
  };

  // Placeholder for updateTripItems (drag and drop reordering)
  const updateTripItems = async (tripId, dayId, newItems) => {
    // This is complex because it involves reordering.
    // For now, let's just update the local state or implement a batch update if needed.
    // A simple way is to delete all items for the day and re-insert (bad for IDs).
    // Better: Upsert with new order_index.

    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        day_id: dayId,
        order_index: index,
        title: item.title, // Include other fields to be safe or just update order
        // ... other fields might be needed if upsert replaces
      }));

      // Ideally we just update order_index.
      // Supabase upsert:
      const { error } = await supabase.from("trip_items").upsert(
        updates.map((item) => ({
          id: item.id,
          day_id: dayId,
          order_index: item.order_index,
          // We need to preserve other fields, but upsert might require them if not partial?
          // Actually 'upsert' works on PK. If we only provide ID and order_index, others might be nullified if we don't be careful?
          // No, Supabase upsert updates columns provided. BUT if it's a new row it needs required cols.
          // Since these exist, it should be an update.
          // However, to be safe, let's just loop update or use a specific RPC.
          // For MVP, let's just loop update (slow but works) or assume full object is passed.
          // The 'newItems' passed from UI usually has all data.
          ...item,
        }))
      );

      if (error) throw error;
      fetchTrips(user.id);
    } catch (error) {
      console.error("Error reordering items:", error);
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        loading,
        user,
        addTrip,
        deleteTrip,
        updateTripItems,
        addTripItem,
        deleteTripItem,
        updateTripItem,
        addExpense,
        updateExpense,
        reorderExpenses,
        deleteExpense,
        addPayer,
        deletePayer,
        renamePayer,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
