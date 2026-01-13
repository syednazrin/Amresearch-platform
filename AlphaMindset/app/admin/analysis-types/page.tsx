"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Card from "@/app/components/ui/Card";
import Modal from "@/app/components/ui/Modal";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Plus, Edit2, Trash2, Clock, DollarSign, Calendar } from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AnalysisType {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  availabilitySlots: AvailabilitySlot[];
  isActive: boolean;
  order: number;
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

export default function AnalysisTypesPage() {
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<AnalysisType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    availabilitySlots: [] as AvailabilitySlot[],
    isActive: true,
    order: 0,
  });
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });

  useEffect(() => {
    fetchAnalysisTypes();
  }, []);

  const fetchAnalysisTypes = async () => {
    try {
      const response = await fetch("/api/analysis-types");
      const data = await response.json();
      setAnalysisTypes(data.analysisTypes || []);
    } catch (error) {
      console.error("Error fetching analysis types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type?: AnalysisType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description,
        duration: type.duration,
        price: type.price,
        availabilitySlots: type.availabilitySlots || [],
        isActive: type.isActive,
        order: type.order,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        availabilitySlots: [],
        isActive: true,
        order: analysisTypes.length,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      availabilitySlots: [],
      isActive: true,
      order: 0,
    });
  };

  const handleAddSlot = () => {
    setFormData({
      ...formData,
      availabilitySlots: [...formData.availabilitySlots, newSlot],
    });
    setNewSlot({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  };

  const handleRemoveSlot = (index: number) => {
    setFormData({
      ...formData,
      availabilitySlots: formData.availabilitySlots.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingType
        ? `/api/analysis-types/${editingType._id}`
        : "/api/analysis-types";
      const method = editingType ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAnalysisTypes();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save analysis type");
      }
    } catch (error) {
      console.error("Error saving analysis type:", error);
      alert("Failed to save analysis type");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis type?")) {
      return;
    }

    try {
      const response = await fetch(`/api/analysis-types/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAnalysisTypes();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete analysis type");
      }
    } catch (error) {
      console.error("Error deleting analysis type:", error);
      alert("Failed to delete analysis type");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis Types</h1>
          <p className="text-gray-600">Manage different types of analysis offerings</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Analysis Type
        </Button>
      </div>

      {analysisTypes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No analysis types yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first analysis type to start accepting bookings
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Analysis Type
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisTypes.map((type) => (
            <Card key={type._id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                    {!type.isActive && (
                      <span className="text-xs text-red-600 font-semibold">Inactive</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(type)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(type._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">{type.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{type.duration} min</span>
                  </div>
                  {type.price > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${type.price}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Available Slots:
                  </p>
                  {type.availabilitySlots && type.availabilitySlots.length > 0 ? (
                    <div className="space-y-1">
                      {type.availabilitySlots.map((slot, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          {DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label}:{" "}
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No slots configured</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingType ? "Edit Analysis Type" : "Add Analysis Type"}
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="E.g., Basic Analysis, Premium Report"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this analysis includes..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes) *"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
              required
            />

            <Input
              label="Price ($)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Slots
            </label>
            
            {formData.availabilitySlots.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.availabilitySlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">
                      {DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label}:{" "}
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newSlot.dayOfWeek}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />

                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <Button onClick={handleAddSlot} variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Slot
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
              {editingType ? "Update" : "Create"}
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
