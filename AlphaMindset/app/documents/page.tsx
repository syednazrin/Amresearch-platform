"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import PublicNav from "@/app/components/PublicNav";
import { formatDate, groupDocumentsByDate, formatDateHeader, normalizeDateToDay } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/constants";
import { Eye, FileText, ChevronDown, ChevronRight, Calendar, Search } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  description: string;
  viewCount: number;
  uploadedAt: string;
  category?: string;
  imageUrl?: string;
  company?: string;
  analyst?: string;
  analystId?: string | null;
  theme?: string;
  industry?: string | null;
}

interface Analyst {
  _id: string;
  name: string;
  title?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterAnalyst, setFilterAnalyst] = useState<string>("");
  const [filterTheme, setFilterTheme] = useState<string>("");
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [scrollToToday, setScrollToToday] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const todayKey = useMemo(() => normalizeDateToDay(new Date()), []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#today-reports") setScrollToToday(true);
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchAnalysts();
  }, []);

  // When landing with #today-reports, expand today and scroll straight to that section (skip content above)
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash === "#today-reports") {
      setExpandedDates((prev) => new Set([...prev, todayKey]));
    }
  }, [todayKey]);

  // Scroll to #today-reports or restore session scroll after content is ready
  useEffect(() => {
    if (loading) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash === "#today-reports") {
      const t = setTimeout(() => {
        const el = document.getElementById("today-reports");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(t);
    }
    if (!containerRef.current) return;
    const lastScrollPosition = sessionStorage.getItem("documentsScrollPosition");
    const lastViewedDate = sessionStorage.getItem("lastViewedDate");
    if (lastScrollPosition && lastViewedDate) {
      const t = setTimeout(() => {
        if (containerRef.current) {
          const dateElement = containerRef.current.querySelector(`[data-date="${lastViewedDate}"]`);
          if (dateElement) {
            dateElement.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            containerRef.current.scrollTop = parseInt(lastScrollPosition, 10);
          }
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [loading]);

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

  const fetchAnalysts = async () => {
    try {
      const res = await fetch("/api/analysts");
      const data = await res.json();
      setAnalysts(data.analysts || []);
    } catch (e) {
      console.error("Error fetching analysts:", e);
    }
  };

  // Filter options: dates and themes from documents; industry from constants + documents.
  const filterOptions = useMemo(() => {
    const dates = new Set<string>();
    const themes = new Set<string>();
    documents.forEach((doc) => {
      dates.add(normalizeDateToDay(doc.uploadedAt));
      const theme = doc.theme ?? doc.category ?? "";
      if (theme) themes.add(theme);
    });
    return {
      dates: Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
      themes: Array.from(themes).sort(),
    };
  }, [documents]);

  // Apply search and filters: search bar (company/title/description), industry, date, analyst, theme.
  useEffect(() => {
    let result = documents;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((doc) => {
        const company = (doc.company ?? doc.category ?? "").toLowerCase();
        const title = (doc.title ?? "").toLowerCase();
        const description = (doc.description ?? "").toLowerCase();
        return company.includes(q) || title.includes(q) || description.includes(q);
      });
    }
    if (filterIndustry) {
      result = result.filter((doc) => (doc.industry ?? "") === filterIndustry);
    }
    if (filterDate) {
      result = result.filter((doc) => normalizeDateToDay(doc.uploadedAt) === filterDate);
    }
    if (filterAnalyst) {
      result = result.filter((doc) => doc.analystId != null && String(doc.analystId) === filterAnalyst);
    }
    if (filterTheme) {
      result = result.filter((doc) => (doc.theme ?? doc.category ?? "") === filterTheme);
    }
    setFilteredDocuments(result);
  }, [documents, searchQuery, filterIndustry, filterDate, filterAnalyst, filterTheme]);

  const toggleDateExpanded = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterIndustry("");
    setFilterDate("");
    setFilterAnalyst("");
    setFilterTheme("");
  };

  const hasActiveFilters = searchQuery.trim() || filterIndustry || filterDate || filterAnalyst || filterTheme;

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
          </div>

          {/* Search and filters: Company search, Industry, Date, Analyst, Theme */}
          <div className="mb-8">
            <p className="text-xs text-gray-500 tracking-wider uppercase mb-3">Search & filter</p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex items-center min-w-[220px]">
                <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company, title..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 text-black bg-white focus:outline-none focus:border-black transition-colors"
                  aria-label="Search company or title"
                />
              </div>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="px-4 py-3 border border-gray-300 text-black bg-white focus:outline-none focus:border-black transition-colors min-w-[140px]"
              >
                <option value="">Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <div className="relative flex items-center min-w-[180px]">
                <Calendar className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 text-black bg-white focus:outline-none focus:border-black transition-colors"
                  title="Filter by date"
                />
              </div>
              <select
                value={filterAnalyst}
                onChange={(e) => setFilterAnalyst(e.target.value)}
                className="px-4 py-3 border border-gray-300 text-black bg-white focus:outline-none focus:border-black transition-colors min-w-[140px]"
              >
                <option value="">Analyst</option>
                {analysts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}{a.title ? ` — ${a.title}` : ""}</option>
                ))}
              </select>
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-3 border border-gray-300 text-black bg-white focus:outline-none focus:border-black transition-colors min-w-[140px]"
              >
                <option value="">Theme</option>
                {filterOptions.themes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-3 text-sm text-gray-600 hover:text-black underline underline-offset-2 transition-colors"
                >
                  Clear filters
                </button>
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
                {hasActiveFilters ? "No reports match the selected filters." : "No reports available yet"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="border border-black px-8 py-4 text-black text-xs tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {scrollToToday && !sortedDateKeys.includes(todayKey) && (
                <div id="today-reports" className="space-y-6 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-light text-black tracking-tight">Today&apos;s reports</h2>
                  <p className="text-sm text-gray-500">No reports published today.</p>
                </div>
              )}
              {sortedDateKeys.map((dateKey) => {
                const dateDocs = groupedDocuments.get(dateKey) || [];
                const dateObj = new Date(dateKey);
                const dateHeader = formatDateHeader(dateObj);
                const reportCount = dateDocs.length;
                const isExpanded = expandedDates.has(dateKey);
                const isToday = dateKey === todayKey;

                return (
                  <div key={dateKey} id={isToday ? "today-reports" : undefined} data-date={dateKey} className="space-y-6">
                    {/* Date Header – clickable to expand/collapse */}
                    <button
                      type="button"
                      onClick={() => toggleDateExpanded(dateKey)}
                      className="flex items-center gap-4 w-full text-left pb-4 border-b border-gray-200 hover:opacity-80 transition-opacity"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <h2 className="text-2xl font-light text-black tracking-tight">
                        {dateHeader}
                      </h2>
                      <span className="text-xs text-gray-400 tracking-wider uppercase">
                        {reportCount} {reportCount === 1 ? "report" : "reports"}
                      </span>
                    </button>

                    {/* Reports List – only when expanded */}
                    {isExpanded && (
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
                                {(doc.company || doc.category) && (
                                  <span className="uppercase">{doc.company || doc.category}</span>
                                )}
                                {doc.industry && (
                                  <span className="uppercase">{doc.industry}</span>
                                )}
                                {doc.theme && (
                                  <span className="uppercase">{doc.theme}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
