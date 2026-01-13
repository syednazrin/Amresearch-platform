"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import PDFViewer from "@/app/components/PDFViewer";
import StarRating from "@/app/components/ui/StarRating";
import Button from "@/app/components/ui/Button";
import Textarea from "@/app/components/ui/Textarea";
import PublicNav from "@/app/components/PublicNav";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { ThumbsUp, ThumbsDown, Eye, Calendar, ArrowLeft } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  viewCount: number;
  category?: string;
  uploadedAt?: string;
  imageUrl?: string;
}

export default function DocumentViewPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedWithThesis, setAgreedWithThesis] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDocument();
      incrementViewCount();
    }
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/documents/${params.id}/view`, { method: "POST" });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (agreedWithThesis === null || rating === 0) {
      alert("Please provide your agreement status and rating");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/documents/${params.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreedWithThesis,
          rating,
          feedback,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-6xl font-extralight text-black tracking-tighter mb-6">Document Not Found</h1>
            <p className="text-sm text-gray-600 mb-8">The document you're looking for doesn't exist</p>
            <button
              onClick={() => router.push('/documents')}
              className="border border-black px-8 py-4 text-black text-xs tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-300"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      
      {/* Main Content - Two Column Layout */}
      <div className="pt-20 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/documents')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Feedback Section */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24">
                <div className="bg-gray-50 border border-gray-200 p-8">
                  {submitted ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-light text-black mb-2 tracking-tight">Thank You</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Your feedback helps us improve our research.</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-light text-black mb-6 tracking-tight">Share Feedback</h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold text-black mb-3 uppercase tracking-wider">
                            Do you agree?
                          </label>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setAgreedWithThesis(true)}
                              className={`flex-1 px-4 py-3 border-2 font-semibold text-xs uppercase tracking-wider transition-all ${
                                agreedWithThesis === true
                                  ? "border-black bg-black text-white"
                                  : "border-gray-300 bg-white text-gray-900 hover:border-black"
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4 mx-auto mb-1" />
                              Yes
                            </button>
                            <button
                              onClick={() => setAgreedWithThesis(false)}
                              className={`flex-1 px-4 py-3 border-2 font-semibold text-xs uppercase tracking-wider transition-all ${
                                agreedWithThesis === false
                                  ? "border-black bg-black text-white"
                                  : "border-gray-300 bg-white text-gray-900 hover:border-black"
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4 mx-auto mb-1" />
                              No
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-black mb-3 uppercase tracking-wider">
                            Rating (1-5)
                          </label>
                          <StarRating value={rating} onChange={setRating} size="md" />
                        </div>

                        <Textarea
                          label="Comments"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Share your thoughts..."
                          rows={4}
                        />

                        <button
                          onClick={handleSubmitFeedback}
                          disabled={submitting || agreedWithThesis === null || rating === 0}
                          className="w-full px-6 py-4 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-[0.3em] uppercase bg-black hover:bg-gray-800"
                        >
                          {submitting ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - PDF Viewer */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <PDFViewer url={document.fileUrl} fileName={document.fileName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
