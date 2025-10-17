"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MailboxPage() {
  const [mails, setMails] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    API.get("/mailbox/my")
      .then((res) => setMails(res.data))
      .catch(() => alert("Failed to load mailbox"));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        📬 My Mailbox
      </h1>

      {mails.length === 0 ? (
        <p className="text-center text-gray-600">No mails yet.</p>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {mails.map((mail) => (
            <div
              key={mail.id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-blue-700 mb-2">
                {mail.subject}
              </h2>
              <p className="text-gray-700 text-sm mb-2">{mail.body}</p>
              <p className="text-xs text-gray-500">
                Sent at: {new Date(mail.sentAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
