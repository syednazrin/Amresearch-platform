"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicNav from "@/app/components/PublicNav";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Eye, FileText, Search, X } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  description: string;
  viewCount: number;
  uploadedAt: string;
  category?: string;
  imageUrl?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents?published=true");
      const data = await response.json();
      const docs = data.documents || [];
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.category?.toLowerCase().includes(searchLower)
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [documents, searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Header Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-6">
              Research Reports
            </h1>
            <div className="w-32 h-px bg-black mb-8"></div>
            <p className="text-sm text-gray-500 tracking-wider">
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "document" : "documents"} available
            </p>
          </div>

          {/* Search Bar */}
          <div className="space-y-8 mb-20">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search reports by title or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:opacity-50 transition-opacity"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              ) : (
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500 tracking-wide">Loading reports...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <p className="text-lg text-gray-500 mb-6 tracking-wide">
                {searchTerm ? "No reports found matching your search." : "No reports available yet"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="border border-black px-8 py-4 text-black text-xs tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => router.push(`/documents/${doc._id}`)}
                  className="group cursor-pointer space-y-6"
                >
                  {/* Document Image or Icon */}
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden border border-gray-200 group-hover:border-black transition-colors duration-300">
                    {doc.imageUrl ? (
                      <Image
                        src={doc.imageUrl}
                        alt={doc.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="w-20 h-20 text-gray-300 group-hover:text-black transition-colors duration-300" />
                      </div>
                    )}
                    {/* View Count Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1 text-xs text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{doc.viewCount}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-light text-black tracking-tight leading-tight group-hover:opacity-70 transition-opacity duration-300">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {doc.description || "No description available"}
                    </p>
                    <p className="text-xs text-gray-400 tracking-wider uppercase">
                      {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
