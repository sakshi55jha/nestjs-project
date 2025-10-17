"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ParticipantPage() {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // 🔹 Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // decode JWT to get userId (optional)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const parsedUserId = parseInt(payload.userId, 10);
       if (!isNaN(parsedUserId)) {
          setUserId(parsedUserId);
      } else {
          // Fallback for non-numeric IDs (like UUIDs)
          setUserId(payload.userId); 
      }  } catch (e) {
      console.error("Invalid token format or unable to parse userId:", e);
    }
  }, [router]);
     
  // 🔹 Fetch competitions
  useEffect(() => {
    if (userId !== null) {
      API.get("/competitions")
        .then((res) => setCompetitions(res.data))
        .catch(() => alert("Failed to fetch competitions"));
    }
  }, [userId]); 

  const handleRegister = async (id: number) => {
    const key = crypto.randomUUID();
    try {
      await API.post(
        `/competitions/${id}/register`,
        {},
        {
          headers: { "Idempotency-Key": key },
        }
      );
      alert("✅ Registered successfully!");
    setCompetitions((prev) =>
      prev.map((comp) =>
        comp.id === id
          ? {
              ...comp,
              registrations: [...(comp.registrations || []), { userId }],
            }
          : comp
      )
    );
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to register");
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      {/* 🔹 Navbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">🏆 Competitions</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/mailbox"
            className="text-blue-700 font-semibold hover:underline"
          >
            📬 View Mailbox
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {competitions.length === 0 ? (
        <p className="text-center text-gray-500">
          No competitions available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {competitions.map((c) => {
            const regCount = c.registrations?.length ?? 0;
            const isFull = regCount >= c.capacity;
            const isDeadlineOver = new Date(c.regDeadline) < new Date();

            // check if user is already registered
            const isRegistered = c.registrations?.some(
              (r: any) => String(r.userId) === String(userId)
            );

            const isDisabled = isFull || isDeadlineOver || isRegistered;
            const buttonText = isRegistered
              ? "Registered"
              : isFull
              ? "Full"
              : isDeadlineOver
              ? "Closed"
              : "Register Now";

            return (
              <div
                key={c.id}
                className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden border border-gray-200"
              >
                <div className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      {c.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {c.description}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mb-2">
                      📅 Deadline:{" "}
                      <span
                        className={`${
                          isDeadlineOver
                            ? "text-red-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {new Date(c.regDeadline).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      👥 Participants:{" "}
                      <span className="text-gray-700">
                        {regCount}/{c.capacity}
                      </span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                    <div
                      className={`h-2.5 rounded-full ${
                        isFull
                          ? "bg-red-500"
                          : isDeadlineOver
                          ? "bg-yellow-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${(regCount / c.capacity) * 100}%` }}
                    ></div>
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={() => !isDisabled && handleRegister(c.id)}
                    disabled={isDisabled}
                    className={`mt-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isDisabled
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
