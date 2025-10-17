"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import API from "@/lib/api";

export default function OrganizerPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    capacity: "",
    regDeadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: form.title,
        description: form.description,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        capacity: Number(form.capacity),
        regDeadline: form.regDeadline,
      };

      await API.post("/competitions", data);
      alert("Competition created!");
      setForm({ title: "", description: "", tags: "", capacity: "", regDeadline: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create competition");
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl font-extrabold text-gray-800 mb-6 text-center"
          variants={itemVariants}
        >
          Create a Competition
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          variants={containerVariants}
        >
          {/** Inputs **/}
          <motion.input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            variants={itemVariants}
            required
          />
          <motion.textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none h-24"
            variants={itemVariants}
            required
          />
          <motion.input
            type="text"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            variants={itemVariants}
          />
          <motion.input
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            variants={itemVariants}
            required
          />
          <motion.input
            type="date"
            value={form.regDeadline}
            onChange={(e) => setForm({ ...form, regDeadline: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            variants={itemVariants}
            required
          />

          {/** Submit Button **/}
          <motion.button
            type="submit"
            className="bg-green-600 text-white font-semibold py-3 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            Create Competition
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
