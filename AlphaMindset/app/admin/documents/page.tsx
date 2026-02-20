"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/app/components/ui/FileUpload";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/Modal";
import PDFViewer from "@/app/components/PDFViewer";
import StarRating from "@/app/components/ui/StarRating";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { formatDate, formatFileSize, formatDateTime } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/constants";
import { Trash2, Edit, Eye, Upload as UploadIcon, ThumbsUp, ThumbsDown, Download, X, ExternalLink } from "lucide-react";

interface Document {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  viewCount: number;
  isPublished: boolean;
  analystId?: string | null;
  company?: string | null;
  category?: string | null;
  industry?: string | null;
  theme?: string | null;
}

interface Analyst {
  _id: string;
  name: string;
  title?: string;
}

interface Feedback {
  _id: string;
  agreedWithThesis: boolean;
  rating: number;
  feedback: string;
  submittedAt: string;
}

interface FeedbackStats {
  total: number;
  agreed: number;
  disagreed: number;
  agreementPercentage: number;
  averageRating: number;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [theme, setTheme] = useState("");
  const [analystId, setAnalystId] = useState<string>("");
  const [analysts, setAnalysts] = useState<Analyst[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'feedback'>('details');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDocument, setEditDocument] = useState<Document | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editAnalystId, setEditAnalystId] = useState<string>("");
  const [editCompany, setEditCompany] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editTheme, setEditTheme] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
    fetchAnalysts();
  }, []);

  const fetchAnalysts = async () => {
    try {
      const res = await fetch("/api/analysts");
      const data = await res.json();
      setAnalysts(data.analysts || []);
    } catch (e) {
      console.error("Error fetching analysts:", e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(".pdf", ""));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPublished", isPublished.toString());
      if (company.trim()) formData.append("company", company.trim());
      if (industry) formData.append("industry", industry);
      if (theme.trim()) formData.append("theme", theme.trim());
      if (analystId) formData.append("analystId", analystId);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Upload failed");
        return;
      }

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setCompany("");
      setIndustry("");
      setTheme("");
      setIsPublished(true);
      setAnalystId("");
      setShowUploadForm(false);

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDocuments();
        if (showModal && selectedDocument?._id === id) {
          setShowModal(false);
        }
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        fetchDocuments();
        if (selectedDocument?._id === id) {
          setSelectedDocument({ ...selectedDocument, isPublished: !currentStatus });
        }
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const handleOpenModal = async (doc: Document) => {
    setSelectedDocument(doc);
    setActiveTab('details');
    setShowModal(true);
    
    // Fetch feedback when modal opens
    fetchFeedback(doc._id);
  };

  const handleOpenEditModal = (doc: Document) => {
    setEditDocument(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description || "");
    setEditCompany(doc.company || doc.category || "");
    setEditIndustry(doc.industry || "");
    setEditTheme(doc.theme || "");
    setEditIsPublished(doc.isPublished);
    setEditAnalystId(doc.analystId ? String(doc.analystId) : "");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditDocument(null);
    setSavingEdit(false);
  };

  const handleSaveEdit = async () => {
    if (!editDocument) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/documents/${editDocument._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          company: editCompany || null,
          industry: editIndustry || null,
          theme: editTheme || null,
          isPublished: editIsPublished,
          analystId: editAnalystId || null,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchDocuments();
      if (selectedDocument?._id === editDocument._id) {
        setSelectedDocument({
          ...selectedDocument,
          title: editTitle,
          description: editDescription,
          company: editCompany || null,
          industry: editIndustry || null,
          theme: editTheme || null,
          isPublished: editIsPublished,
          analystId: editAnalystId || null,
        });
      }
      handleCloseEditModal();
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchFeedback = async (docId: string) => {
    setLoadingFeedback(true);
    try {
      const response = await fetch(`/api/documents/${docId}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        setFeedbackStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const exportFeedbackToCSV = () => {
    if (!selectedDocument) return;
    
    const headers = ["Date", "Agreement", "Rating", "Feedback"];
    const rows = feedback.map((f) => [
      formatDateTime(f.submittedAt),
      f.agreedWithThesis ? "Agreed" : "Disagreed",
      f.rating.toString(),
      `"${f.feedback.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `feedback-${selectedDocument._id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <span className="text-xl leading-none mr-1">+</span>
          <span className="text-base">upload document</span>
        </Button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>
          
          <div className="space-y-4">
            {!selectedFile ? (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="application/pdf"
                label="Upload PDF Document"
              />
            ) : (
              <div className="border-2 border-primary rounded-xl p-4 bg-gray-50">
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:underline mt-2"
                >
                  Remove file
                </button>
              </div>
            )}

            {selectedFile && (
              <>
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  required
                />

                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document"
                />

                <Input
                  label="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Earnings, Sector outlook"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Analyst</label>
                  <select
                    value={analystId}
                    onChange={(e) => setAnalystId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">No analyst</option>
                    {analysts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}{a.title ? ` — ${a.title}` : ""}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPublished" className="text-sm text-gray-900">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleUpload} disabled={uploading || !title}>
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowUploadForm(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Industry</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Theme</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Analyst</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">File</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Uploaded</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr 
                    key={doc._id} 
                    onClick={() => handleOpenModal(doc)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.company || doc.category || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.industry || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.theme || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doc.analystId ? (analysts.find((a) => a._id === String(doc.analystId))?.name ?? '—') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doc.viewCount}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublished(doc._id, doc.isPublished);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {doc.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(doc);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(doc);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc._id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Details Modal */}
      {showModal && selectedDocument && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedDocument.title}
          size="xl"
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'details'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Document Details
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === 'feedback'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Feedback
                  {feedbackStats && feedbackStats.total > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                      {feedbackStats.total}
                    </span>
                  )}
                </button>
              </div>
              
              {selectedDocument.isPublished && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/documents/${selectedDocument._id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </Button>
              )}
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">File Name</p>
                      <p className="font-semibold text-gray-900">{selectedDocument.fileName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">File Size</p>
                      <p className="font-semibold text-gray-900">{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Uploaded</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Views</p>
                      <p className="font-semibold text-gray-900">{selectedDocument.viewCount}</p>
                    </div>
                    {selectedDocument.analystId && (
                      <div>
                        <p className="text-gray-600">Analyst</p>
                        <p className="font-semibold text-gray-900">
                          {analysts.find((a) => a._id === String(selectedDocument.analystId))?.name ?? "—"}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedDocument.description && (
                    <div className="mt-4">
                      <p className="text-gray-600">Description</p>
                      <p className="text-gray-900 mt-1">{selectedDocument.description}</p>
                    </div>
                  )}
                </div>

                <PDFViewer url={selectedDocument.fileUrl} fileName={selectedDocument.fileName} />
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {loadingFeedback ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading feedback...</p>
                  </div>
                ) : (
                  <>
                    {feedbackStats && feedbackStats.total > 0 && (
                      <>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={exportFeedbackToCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Total Feedback</p>
                            <p className="text-2xl font-bold text-gray-900">{feedbackStats.total}</p>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Agreement Rate</p>
                            <p className="text-2xl font-bold text-green-600">{feedbackStats.agreementPercentage}%</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {feedbackStats.agreed} agreed, {feedbackStats.disagreed} disagreed
                            </p>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Average Rating</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-gray-900">{feedbackStats.averageRating}</p>
                              <StarRating value={feedbackStats.averageRating} readonly size="sm" />
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Comments</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {feedback.filter((f) => f.feedback).length}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="max-h-[500px] overflow-y-auto">
                      {feedback.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">No feedback received yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {feedback.map((item) => (
                            <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {item.agreedWithThesis ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                      <ThumbsUp className="w-4 h-4" />
                                      <span className="font-semibold text-sm">Agreed</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                      <ThumbsDown className="w-4 h-4" />
                                      <span className="font-semibold text-sm">Disagreed</span>
                                    </div>
                                  )}
                                  <div className="w-px h-5 bg-gray-300" />
                                  <StarRating value={item.rating} readonly size="sm" />
                                </div>
                                <p className="text-xs text-gray-500">{formatDateTime(item.submittedAt)}</p>
                              </div>
                              {item.feedback && (
                                <p className="text-sm text-gray-700">{item.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Document Modal */}
      {showEditModal && editDocument && (
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title="Edit document"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Report title"
            />
            <Textarea
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief description"
              rows={3}
            />
            <Input
              label="Company"
              value={editCompany}
              onChange={(e) => setEditCompany(e.target.value)}
              placeholder="Company name"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="">— None —</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <Input
              label="Theme"
              value={editTheme}
              onChange={(e) => setEditTheme(e.target.value)}
              placeholder="e.g. Earnings, Sector outlook"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Analyst</label>
              <select
                value={editAnalystId}
                onChange={(e) => setEditAnalystId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="">— None —</option>
                {analysts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-published"
                checked={editIsPublished}
                onChange={(e) => setEditIsPublished(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="edit-published" className="text-sm font-medium text-gray-700">
                Published
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCloseEditModal} disabled={savingEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
