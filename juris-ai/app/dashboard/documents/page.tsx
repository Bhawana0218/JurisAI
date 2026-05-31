"use client";

import { FileText, Upload, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Documents</h1>
          <p className="mt-1 text-sm text-[#7aa0d8]">Manage your legal documents</p>
        </div>
        <Link
          href="#"
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2a4f96] to-[#1e3a70] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2a4f96]/20 transition hover:from-[#4a72c4] hover:to-[#2a4f96]"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a72c4]" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-xl border border-[#162d58] bg-[#0a1628] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4a72c4] outline-none transition focus:border-[#2a4f96]"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[#162d58] bg-[#0a1628] px-4 py-2.5 text-sm text-[#7aa0d8] transition hover:border-[#2a4f96] hover:text-white">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="rounded-2xl border border-[#162d58] bg-[#0a1628] p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-[#2a4f96]" />
        <h3 className="mt-4 text-lg font-semibold text-white">No documents yet</h3>
        <p className="mt-1 text-sm text-[#7aa0d8]">Upload your first legal document to get started.</p>
      </div>
    </div>
  );
}
