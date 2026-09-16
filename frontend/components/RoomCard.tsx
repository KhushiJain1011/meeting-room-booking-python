"use client";

import { useState } from "react";
import { Clock, Plus, Search } from "lucide-react";

import {
  getNextAvailableSlot,
  type Booking,
  type Room,
  type NextAvailableSlot,
} from "@/lib/api";

import BookingList from "./BookingList";

interface RoomCardProps {
  room: Room;
  bookings: Booking[];
  selectedDate: string;
  onBook: (roomId: number) => void;
  onCancel: (bookingId: number) => void;
  cancellingId: number | null;
  onError: (message: string) => void;
}

export default function RoomCard({
  room,
  bookings,
  selectedDate,
  onBook,
  onCancel,
  cancellingId,
  onError,
}: RoomCardProps) {
  const [duration, setDuration] = useState("");
  const [slot, setSlot] = useState<NextAvailableSlot | null>(null);
  const [findingSlot, setFindingSlot] = useState(false);

  async function handleFindNextAvailable() {
    const durationMinutes = Number(duration);

    if (!duration.trim()) {
      onError("Please enter a duration.");
      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      onError("Duration must be a positive number of minutes.");
      return;
    }

    setFindingSlot(true);
    setSlot(null);

    try {
      const result = await getNextAvailableSlot(
        room.id,
        selectedDate,
        durationMinutes
      );

      if ("message" in result) {
        onError(result.message);
        return;
      }

      setSlot(result);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to find an available slot."
      );
    } finally {
      setFindingSlot(false);
    }
  }

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  return (
    <section className="rounded-2xl border bg-gray-50/50 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {room.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"}
          </p>
        </div>

        <button
          onClick={() => onBook(room.id)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Book Room
        </button>
      </div>

      {/* Next available slot */}
      <div className="mb-5 rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />

          <h3 className="text-sm font-semibold text-gray-800">
            Find next available slot
          </h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor={`duration-${room.id}`}
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Duration (minutes)
            </label>

            <input
              id={`duration-${room.id}`}
              type="number"
              min="1"
              value={duration}
              onChange={(event) => {
                setDuration(event.target.value);
                setSlot(null);
              }}
              placeholder="e.g. 45"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFindNextAvailable}
              disabled={findingSlot}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Search className="h-4 w-4" />

              {findingSlot
                ? "Finding..."
                : "Find Available"}
            </button>
          </div>
        </div>

        {slot && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Earliest available slot
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatTime(slot.start_time)} –{" "}
              {formatTime(slot.end_time)}
            </p>
          </div>
        )}
      </div>

      <BookingList
        bookings={bookings}
        onCancel={onCancel}
        cancellingId={cancellingId}
      />
    </section>
  );
}