"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PublicNav from "@/app/components/PublicNav";
import { formatDate, groupDocumentsByDate, formatDateHeader, normalizeDateToDay } from "@/lib/utils";
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    // Restore scroll position
    const lastScrollPosition = sessionStorage.getItem('documentsScrollPosition');
    const lastViewedDate = sessionStorage.getItem('lastViewedDate');
    
    if (lastScrollPosition && lastViewedDate) {
      setTimeout(() => {
        if (containerRef.current) {
          const dateElement = containerRef.current.querySelector(`[data-date="${lastViewedDate}"]`);
          if (dateElement) {
            dateElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            containerRef.current.scrollTop = parseInt(lastScrollPosition, 10);
          }
        }
      }, 100);
    }
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

  const handleDocumentClick = (doc: Document) => {
    // Save scroll position and date
    if (containerRef.current) {
      sessionStorage.setItem('documentsScrollPosition', containerRef.current.scrollTop.toString());
      sessionStorage.setItem('lastViewedDate', normalizeDateToDay(doc.uploadedAt));
      sessionStorage.setItem('lastOpenedDocumentId', doc._id);
    }
    router.push(`/documents/${doc._id}`);
  };

  // Group filtered documents by date
  const groupedDocuments = groupDocumentsByDate(filteredDocuments);
  
  // Sort date keys in descending order (newest first)
  const sortedDateKeys = Array.from(groupedDocuments.keys()).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Header Section */}
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-3">
              Research Reports
            </h1>
            <div className="w-32 h-px bg-black mb-3"></div>
            <p className="text-sm text-gray-500 tracking-wider">
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "document" : "documents"} available
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
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

      {/* Documents List - Date Grouped */}
      <div className="px-6 pb-32" ref={containerRef}>
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
            <div className="space-y-12">
              {sortedDateKeys.map((dateKey) => {
                const dateDocs = groupedDocuments.get(dateKey) || [];
                const dateObj = new Date(dateKey);
                const dateHeader = formatDateHeader(dateObj);
                const reportCount = dateDocs.length;

                return (
                  <div key={dateKey} data-date={dateKey} className="space-y-6">
                    {/* Date Header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                      <h2 className="text-2xl font-light text-black tracking-tight">
                        {dateHeader}
                      </h2>
                      <span className="text-xs text-gray-400 tracking-wider uppercase">
                        {reportCount} {reportCount === 1 ? "report" : "reports"}
                      </span>
                    </div>

                    {/* Reports List */}
                    <div className="space-y-6 pl-4">
                      {dateDocs.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => handleDocumentClick(doc)}
                          className="group cursor-pointer py-4 border-b border-gray-100 hover:border-gray-300 transition-colors duration-200"
                        >
                          <div className="space-y-2">
                            <h3 className="text-xl font-light text-black tracking-tight leading-tight group-hover:opacity-70 transition-opacity duration-300">
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400 tracking-wider">
                              <span className="uppercase">{formatDate(doc.uploadedAt)}</span>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{doc.viewCount} {doc.viewCount === 1 ? "view" : "views"}</span>
                              </div>
                              {doc.category && (
                                <span className="uppercase">{doc.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
