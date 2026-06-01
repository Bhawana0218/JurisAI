"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-12 text-center">
        <MessageSquare className="mx-auto mb-4 h-8 w-8 text-indigo-600" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
        <p className="mt-2 text-gray-500">Get in touch with the JurisAI team</p>
      </div>

      {sent ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
          <Mail className="mx-auto mb-4 h-10 w-10 text-green-600" />
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">Message Sent!</h2>
          <p className="mt-2 text-green-700 dark:text-green-300">We&apos;ll get back to you within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} required className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
            <Send className="h-4 w-4" /> Send Message
          </button>
        </form>
      )}
    </div>
  );
}
