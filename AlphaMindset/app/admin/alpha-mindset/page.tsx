"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Modal from "@/app/components/ui/Modal";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, FileText, Calendar } from "lucide-react";

interface AlphaMindsetItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  theme?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAlphaMindsetPage() {
  const [items, setItems] = useState<AlphaMindsetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AlphaMindsetItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    theme: "",
    publishedAt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/alpha-mindset");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: AlphaMindsetItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        excerpt: item.excerpt || "",
        content: item.content,
        theme: item.theme || "",
        publishedAt: new Date(item.publishedAt).toISOString().split("T")[0],
      });
    } else {
      setEditingItem(null);
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        title: "Alpha Mindset Commentary",
        excerpt: "",
        content: "",
        theme: "",
        publishedAt: today,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      alert("Content is required.");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingItem ? `/api/alpha-mindset/${editingItem._id}` : "/api/alpha-mindset";
      const method = editingItem ? "PATCH" : "POST";
      const body = editingItem
        ? { ...formData, publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : undefined }
        : { ...formData, publishedAt: formData.publishedAt || new Date().toISOString() };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        handleCloseModal();
        fetchItems();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this Alpha Mindset commentary?")) return;
    try {
      const res = await fetch(`/api/alpha-mindset/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
      else alert("Failed to delete.");
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Alpha Mindset</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Commentary
        </Button>
      </div>

      <p className="text-sm text-gray-600">
        Manage thought-leadership commentaries from the Head of Institutional Sales shown on the Alpha Mindset page. Use the excerpt for the insight capsule; the full content appears in the commentary section.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No Alpha Mindset commentaries yet.</p>
            <Button onClick={() => handleOpenModal()} className="mt-4">
              <Plus className="w-5 h-5 mr-2" />
              Add first commentary
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Theme
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{item.excerpt}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(item.publishedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.theme || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
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

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Alpha Mindset Commentary" : "Add Alpha Mindset Commentary"}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Q1 2025 Market Outlook"
          />
          <Input
            label="Theme (optional)"
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            placeholder="e.g. Macro View, Risk Framework"
          />
          <Input
            label="Published date"
            type="date"
            value={formData.publishedAt}
            onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
          />
          <Textarea
            label="Excerpt (Insight Capsule / pull quote)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Short pull-quote for the hero and featured panel."
            rows={2}
          />
          <Textarea
            label="Full commentary *"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Full Alpha Mindset write-up. Use paragraphs (blank lines between)."
            rows={12}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Saving…" : editingItem ? "Update" : "Publish"}
            </Button>
            <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
