"use client";

import { motion } from "framer-motion";

const testimonials = [
  { quote: "JurisAI has transformed our legal research workflow. What used to take hours now takes minutes.", author: "Sarah Chen", role: "Partner, Chen & Associates", rating: 5 },
  { quote: "The AI agent marketplace is a game-changer. We built custom workflows that automate our entire contract review process.", author: "James Mitchell", role: "General Counsel, TechCorp", rating: 5 },
  { quote: "Enterprise-grade security with consumer-grade usability. Our entire firm adopted it in days.", author: "Dr. Priya Sharma", role: "Managing Partner, Sharma Legal", rating: 5 },
  { quote: "The knowledge graph feature alone saves us hours of legal research every day. It connects cases and statutes we never would have found.", author: "Michael Torres", role: "Senior Attorney, Torres Law", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by legal professionals worldwide
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < t.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
              </div>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="font-semibold text-gray-900 dark:text-white">{t.author}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
