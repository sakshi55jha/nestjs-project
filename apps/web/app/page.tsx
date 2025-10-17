"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-sm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide">Competors</h1>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-8 md:px-20 mt-12 md:mt-20">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Compete. Learn. <span className="text-blue-700">Grow.</span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Join exciting competitions, connect with like-minded people, and challenge yourself to
            achieve new heights with Competors.
          </p>
          <div className="mt-6 flex gap-4 justify-center md:justify-start">
            <Link
              href="/competitions"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Explore Competitions
            </Link>
            <Link
              href="/about"
              className="border border-blue-600 text-blue-700 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          src="https://illustrations.popsy.co/gray/competition.svg"
          alt="Competition Illustration"
          className="w-full md:w-1/2 mb-10 md:mb-0"
        />
      </section>

      {/* Features Section */}
      <section className="px-8 md:px-20 py-16 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Why Choose <span className="text-blue-700">Competors?</span>
        </h3>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Discover Competitions",
              desc: "Find exciting challenges across different fields — tech, design, business, and more.",
            },
            {
              title: "Track Your Progress",
              desc: "Stay updated on upcoming competitions and manage your registrations easily.",
            },
            {
              title: "Grow with Community",
              desc: "Compete with talented peers, learn from others, and showcase your skills.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-6 bg-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <h4 className="text-xl font-semibold text-blue-700 mb-2">{f.title}</h4>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-white text-center py-6 mt-auto">
        <p>© {new Date().getFullYear()} Competors. All rights reserved.</p>
      </footer>
    </main>
  );
}
