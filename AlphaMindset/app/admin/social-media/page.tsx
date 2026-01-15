"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Textarea from "@/app/components/ui/Textarea";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Instagram, ArrowUp, ArrowDown } from "lucide-react";

interface SocialMediaEmbed {
  _id: string;
  embedCode: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSocialMediaPage() {
  const [embeds, setEmbeds] = useState<SocialMediaEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<SocialMediaEmbed | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [order, setOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmbeds();
  }, []);

  const fetchEmbeds = async () => {
    try {
      const response = await fetch("/api/social-media");
      const data = await response.json();
      setEmbeds(data.embeds || []);
    } catch (error) {
      console.error("Error fetching social media embeds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (embed?: SocialMediaEmbed) => {
    if (embed) {
      setEditingEmbed(embed);
      setEmbedCode(embed.embedCode);
      setOrder(embed.order);
    } else {
      setEditingEmbed(null);
      setEmbedCode("");
      setOrder(embeds.length + 1);
    }
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmbed(null);
    setEmbedCode("");
    setOrder(1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!embedCode.trim()) {
      setError("Embed code is required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const url = editingEmbed ? `/api/social-media/${editingEmbed._id}` : "/api/social-media";
      const method = editingEmbed ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedCode: embedCode.trim(), order }),
      });

      if (response.ok) {
        handleCloseModal();
        fetchEmbeds();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save embed");
      }
    } catch (error) {
      console.error("Error saving embed:", error);
      setError("Failed to save embed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Instagram embed?")) return;

    try {
      const response = await fetch(`/api/social-media/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchEmbeds();
      } else {
        alert("Failed to delete embed");
      }
    } catch (error) {
      console.error("Error deleting embed:", error);
      alert("Failed to delete embed");
    }
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const embed = embeds.find(e => e._id === id);
    if (!embed) return;

    const newOrder = direction === 'up' ? embed.order - 1 : embed.order + 1;
    if (newOrder < 1 || newOrder > 3) return;

    try {
      const response = await fetch(`/api/social-media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedCode: embed.embedCode, order: newOrder }),
      });

      if (response.ok) {
        fetchEmbeds();
      } else {
        alert("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-4">
          Social Media
        </h1>
        <div className="w-24 h-px bg-black mb-4"></div>
        <p className="text-sm text-gray-600">
          Manage Instagram embeds displayed on the landing page (maximum 3)
        </p>
      </div>

      {/* Add Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {embeds.length} / 3 embeds configured
        </div>
        <Button
          onClick={() => handleOpenModal()}
          disabled={embeds.length >= 3}
        >
          + add instagram embed
        </Button>
      </div>

      {/* Embeds List */}
      <div className="border border-gray-200">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={3} />
          </div>
        ) : embeds.length === 0 ? (
          <div className="p-12 text-center">
            <Instagram className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No Instagram embeds configured</p>
            <p className="text-sm text-gray-500">
              Add up to 3 Instagram embeds to display on the landing page
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {embeds.map((embed, index) => (
              <div
                key={embed._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-black text-white text-sm font-semibold">
                        {embed.order}
                      </div>
                      <div className="text-xs text-gray-500 tracking-wider uppercase">
                        Order {embed.order}
                      </div>
                      <div className="text-xs text-gray-400">
                        Updated {formatDate(embed.updatedAt)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono">
                        {embed.embedCode.substring(0, 200)}
                        {embed.embedCode.length > 200 ? "..." : ""}
                      </pre>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveOrder(embed._id, 'up')}
                        disabled={embed.order === 1}
                        className="p-1 border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(embed._id, 'down')}
                        disabled={embed.order === embeds.length}
                        className="p-1 border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleOpenModal(embed)}
                      className="p-2 border border-gray-200 hover:border-black transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(embed._id)}
                      className="p-2 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingEmbed ? "Edit Instagram Embed" : "Add Instagram Embed"}
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Paste the full Instagram embed blockquote code here. You can get this by:
            </p>
            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-2 mb-4">
              <li>Go to the Instagram post you want to embed</li>
              <li>Click the three dots (...) and select "Embed"</li>
              <li>Copy the entire blockquote code</li>
              <li>Paste it in the field below</li>
            </ol>
          </div>

          <Textarea
            label="Instagram Embed Code"
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            placeholder='<blockquote class="instagram-media" data-instgrm-permalink="..." ...>'
            rows={8}
            className="font-mono text-xs"
            error={error}
          />

          <Input
            label="Display Order (1-3)"
            type="number"
            min={1}
            max={3}
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingEmbed ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
