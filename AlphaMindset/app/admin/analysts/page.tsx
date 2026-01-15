"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import Modal from "@/app/components/ui/Modal";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Plus, Edit2, Trash2, User } from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Analyst {
  _id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  availabilitySlots: AvailabilitySlot[];
  isActive: boolean;
  order: number;
  sectors?: string[];
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export default function AnalystsPage() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnalyst, setEditingAnalyst] = useState<Analyst | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photoUrl: "",
    availabilitySlots: [] as AvailabilitySlot[],
    isActive: true,
    order: 0,
    sectors: [] as string[],
  });
  const [newSector, setNewSector] = useState("");

  useEffect(() => {
    fetchAnalysts();
  }, []);

  const fetchAnalysts = async () => {
    try {
      const response = await fetch("/api/analysts");
      const data = await response.json();
      setAnalysts(data.analysts || []);
    } catch (error) {
      console.error("Error fetching analysts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (analyst?: Analyst) => {
    if (analyst) {
      setEditingAnalyst(analyst);
      setFormData({
        name: analyst.name,
        title: analyst.title,
        bio: analyst.bio,
        photoUrl: analyst.photoUrl,
        availabilitySlots: analyst.availabilitySlots || [],
        isActive: analyst.isActive,
        order: analyst.order,
        sectors: analyst.sectors || [],
      });
    } else {
      setEditingAnalyst(null);
      setFormData({
        name: "",
        title: "",
        bio: "",
        photoUrl: "",
        availabilitySlots: [],
        isActive: true,
        order: analysts.length,
        sectors: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnalyst(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      photoUrl: "",
      availabilitySlots: [],
      isActive: true,
      order: 0,
      sectors: [],
    });
    setNewSector("");
  };

  const handleAddSector = () => {
    const value = newSector.trim();
    if (!value) return;
    if (formData.sectors.includes(value)) {
      setNewSector("");
      return;
    }
    setFormData({
      ...formData,
      sectors: [...formData.sectors, value],
    });
    setNewSector("");
  };

  const handleRemoveSector = (index: number) => {
    setFormData({
      ...formData,
      sectors: formData.sectors.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingAnalyst
        ? `/api/analysts/${editingAnalyst._id}`
        : "/api/analysts";
      const method = editingAnalyst ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAnalysts();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save analyst");
      }
    } catch (error) {
      console.error("Error saving analyst:", error);
      alert("Failed to save analyst");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analyst?")) {
      return;
    }

    try {
      const response = await fetch(`/api/analysts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAnalysts();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete analyst");
      }
    } catch (error) {
      console.error("Error deleting analyst:", error);
      alert("Failed to delete analyst");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysts</h1>
          <p className="text-gray-600">Manage your team of analysts</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          + add analyst
        </Button>
      </div>

      {analysts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No analysts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first analyst to start accepting bookings
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Analyst
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysts.map((analyst) => (
            <Card key={analyst._id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {analyst.photoUrl ? (
                      <img
                        src={analyst.photoUrl}
                        alt={analyst.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{analyst.name}</h3>
                      {analyst.title && (
                        <p className="text-sm text-gray-600">{analyst.title}</p>
                      )}
                      {!analyst.isActive && (
                        <span className="text-xs text-red-600 font-semibold">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(analyst)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(analyst._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {analyst.sectors && analyst.sectors.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase mb-1">
                      Sectors Covered
                    </p>
                    <p className="text-sm text-gray-600">
                      {analyst.sectors.join(", ")}
                    </p>
                  </div>
                )}

                {analyst.bio && (
                  <p className="text-gray-600 text-sm">{analyst.bio}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAnalyst ? "Edit Analyst" : "Add Analyst"}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Senior Investment Analyst"
          />

          <Input
            label="Photo URL"
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            placeholder="https://example.com/photo.jpg"
          />

          {/* Sectors Covered */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sectors Covered
            </label>

            {formData.sectors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.sectors.map((sector, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    {sector}
                    <button
                      type="button"
                      onClick={() => handleRemoveSector(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                label=""
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                placeholder="e.g. Technology, Healthcare"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSector}
                className="self-start mt-1"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (visible to users)
            </label>
          </div>

          <Input
            label="Display Order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {editingAnalyst ? "Update" : "Create"}
            </Button>
            <Button onClick={handleCloseModal} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
