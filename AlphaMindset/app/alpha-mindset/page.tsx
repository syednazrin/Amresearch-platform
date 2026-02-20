"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicNav from "@/app/components/PublicNav";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Quote, Calendar, FileText } from "lucide-react";

export interface AlphaMindsetItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  theme?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AlphaMindsetPage() {
  const [latest, setLatest] = useState<AlphaMindsetItem | null>(null);
  const [archive, setArchive] = useState<AlphaMindsetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AlphaMindsetItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [latestRes, listRes] = await Promise.all([
          fetch("/api/alpha-mindset?latest=true"),
          fetch("/api/alpha-mindset"),
        ]);
        const latestData = await latestRes.json();
        const listData = await listRes.json();
        setLatest(latestData.item || null);
        setArchive(listData.items || []);
        if (latestData.item) setSelectedId(latestData.item._id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(latest || null);
      return;
    }
    if (latest?._id === selectedId) {
      setSelectedItem(latest);
      return;
    }
    const found = archive.find((a) => a._id === selectedId);
    setSelectedItem(found || null);
  }, [selectedId, latest, archive]);

  const insightQuote = selectedItem?.excerpt?.trim() || selectedItem?.content?.slice(0, 280)?.trim() || "Our strategic view and conviction-driven thinking shape how we position the fund.";

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />

      {/* Hero: Insight Capsule with subtle portrait in corner */}
      <section className="relative bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs text-gray-500 tracking-[0.3em] uppercase mb-4">
              Strategic Voice of the Fund
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-8">
              Alpha Mindset
            </h1>
            <div className="relative bg-gray-50 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 pr-24 pb-20 md:pr-28 md:pb-24">
              <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-200" aria-hidden />
              <blockquote className="relative pl-6 text-gray-700 leading-relaxed text-lg md:text-xl font-light pr-2">
                {loading ? (
                  <span className="animate-pulse">Loading latest insight…</span>
                ) : (
                  <>"{insightQuote}"</>
                )}
              </blockquote>
              <p className="mt-4 text-sm text-gray-500 font-medium pr-2">
                — Mr. Jeffrey Ng Keng Luen, Head of Institutional Sales
              </p>
              {/* Small circular portrait – bottom right, not center of attention */}
              <div className="absolute bottom-4 right-4 w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                <Image
                  src="/JeffreyNgKengLuen.jpg"
                  alt="Mr. Jeffrey Ng Keng Luen, Head of Institutional Sales"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured insight panel + full commentary */}
      <section className="relative py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {loading ? (
            <div className="py-24 text-center text-gray-500">Loading commentary…</div>
          ) : selectedItem ? (
            <>
              <div className="mb-12">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedItem.publishedAt)}
                  </span>
                  {selectedItem.theme && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                      {selectedItem.theme}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">
                  {selectedItem.title}
                </h2>
              </div>

              {/* Full commentary – editorial style */}
              <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                {selectedItem.content.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="text-base md:text-lg">
                    {para.trim()}
                  </p>
                ))}
              </article>
            </>
          ) : (
            <div className="py-24 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No Alpha Mindset commentary has been published yet.</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon for strategic insights from our CIO.</p>
            </div>
          )}
        </div>
      </section>

      {/* Archive / timeline */}
      {archive.length > 0 && (
        <section className="relative py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-light text-black tracking-tight mb-8">
              Commentary archive
            </h2>
            <ul className="space-y-4">
              {archive.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item._id)}
                    className={`w-full text-left px-4 py-4 rounded-xl border transition-colors ${
                      selectedId === item._id
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>{formatDate(item.publishedAt)}</span>
                      {item.theme && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {item.theme}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.excerpt && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.excerpt}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA back to home */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase hover:opacity-80 transition-opacity"
            style={{ color: '#FF0009' }}
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs text-gray-400 tracking-wider">
            © {new Date().getFullYear()} AMINVEST. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
