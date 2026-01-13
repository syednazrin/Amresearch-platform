"use client";

import { useState, useEffect } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Modal from "@/app/components/ui/Modal";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, MapPin, Calendar } from "lucide-react";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    date: "",
    location: "",
    description: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips");
      const data = await response.json();
      setTrips(data.trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        companyName: trip.companyName,
        date: new Date(trip.date).toISOString().split("T")[0],
        location: trip.location,
        description: trip.description,
        imageUrl: trip.imageUrl || "",
      });
    } else {
      setEditingTrip(null);
      setFormData({
        companyName: "",
        date: "",
        location: "",
        description: "",
        imageUrl: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.date || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingTrip ? `/api/trips/${editingTrip._id}` : "/api/trips";
      const method = editingTrip ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseModal();
        fetchTrips();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save trip");
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const response = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchTrips();
      } else {
        alert("Failed to delete trip");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Company Visits</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Trip
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : trips.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No trips scheduled yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {trip.imageUrl && (
                          <img
                            src={trip.imageUrl}
                            alt={trip.companyName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <p className="font-semibold text-gray-900">{trip.companyName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(trip.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{trip.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(trip)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip._id)}
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
        title={editingTrip ? "Edit Trip" : "Add New Trip"}
      >
        <div className="space-y-4">
          <Input
            label="Company Name *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g., Tesla Inc."
            required
          />

          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="Location *"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Fremont, CA"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the visit"
            rows={3}
          />

          <Input
            label="Image URL (optional)"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Saving..." : editingTrip ? "Update Trip" : "Add Trip"}
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
