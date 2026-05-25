"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  status: string;
  expiresAt: string;
  productId: string;
  warehouseId: string;
  quantity: number;
};

export default function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function loadReservation() {
      const resolvedParams = await params;
      const res = await fetch(`/api/reservations/${resolvedParams.id}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setMessage("Reservation not found");
        return;
      }

      const data = await res.json();
      setReservation(data);
    }

    loadReservation();
  }, [params]);

  useEffect(() => {
    if (!reservation) return;

    const interval = setInterval(() => {
      const diff = new Date(reservation.expiresAt).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function confirmReservation() {
    const resolvedParams = await params;

    const res = await fetch(`/api/reservations/${resolvedParams.id}/confirm`, {
      method: "PATCH",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Confirm failed");
      return;
    }

    setMessage("Reservation confirmed! Redirecting home...");
    setReservation({ ...reservation!, status: "CONFIRMED" });

    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  }

  async function cancelReservation() {
    const resolvedParams = await params;

    const res = await fetch(`/api/reservations/${resolvedParams.id}/cancel`, {
      method: "PATCH",
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Cancel failed");
      return;
    }

    setMessage("Reservation cancelled! Redirecting home...");
    setReservation({ ...reservation!, status: "RELEASED" });

    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  }

  if (!reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-black">
        <div className="rounded-xl bg-white p-6 shadow">Loading reservation...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold">Reservation Details</h1>

        <div className="mt-6 space-y-3">
          <p><span className="font-semibold">Reservation ID:</span> {reservation.id}</p>
          <p><span className="font-semibold">Status:</span> {reservation.status}</p>
          <p><span className="font-semibold">Quantity:</span> {reservation.quantity}</p>
          <p><span className="font-semibold">Expires In:</span> {timeLeft}</p>
        </div>

        {message && (
          <div className="mt-5 rounded bg-blue-100 p-3 text-blue-700">
            {message}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={confirmReservation}
            disabled={reservation.status !== "PENDING"}
            className="rounded-lg bg-green-600 px-5 py-2 text-white disabled:bg-gray-400"
          >
            Confirm
          </button>

          <button
            onClick={cancelReservation}
            disabled={reservation.status !== "PENDING"}
            className="rounded-lg bg-red-600 px-5 py-2 text-white disabled:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}