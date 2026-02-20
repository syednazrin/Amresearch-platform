"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Modal from "@/app/components/ui/Modal";
import FileUpload from "@/app/components/ui/FileUpload";
import { TableSkeleton } from "@/app/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, MapPin, Calendar, X, Users, Download } from "lucide-react";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
  isOnline?: boolean;
}

interface Registration {
  _id: string;
  tripId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  status?: string;
  createdAt: string;
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
    isOnline: false,
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [tripForRegistrations, setTripForRegistrations] = useState<Trip | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const imagePreviewUrl = useMemo(
    () => (selectedImageFile ? URL.createObjectURL(selectedImageFile) : null),
    [selectedImageFile]
  );
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

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
    setSelectedImageFile(null);
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        companyName: trip.companyName,
        date: new Date(trip.date).toISOString().split("T")[0],
        location: trip.location || "",
        description: trip.description,
        imageUrl: trip.imageUrl || "",
        isOnline: trip.isOnline === true || (trip.location || "").toLowerCase() === "online",
      });
    } else {
      setEditingTrip(null);
      setFormData({
        companyName: "",
        date: "",
        location: "",
        description: "",
        imageUrl: "",
        isOnline: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setSelectedImageFile(null);
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.date) {
      alert("Please fill in company name and date");
      return;
    }
    if (!formData.isOnline && !formData.location.trim()) {
      alert("Please enter a location or mark the trip as online");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = formData.imageUrl;
      if (selectedImageFile) {
        const form = new FormData();
        form.append("image", selectedImageFile);
        const uploadRes = await fetch("/api/trips/upload-image", {
          method: "POST",
          body: form,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error || "Failed to upload image");
          setSubmitting(false);
          return;
        }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const url = editingTrip ? `/api/trips/${editingTrip._id}` : "/api/trips";
      const method = editingTrip ? "PATCH" : "POST";
      const body = {
        ...formData,
        imageUrl,
        location: formData.isOnline ? "Online" : formData.location.trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const exportRegistrationsToExcel = () => {
    if (!tripForRegistrations || registrations.length === 0) return;
    const escape = (v: string) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const headers = ["Name", "Email", "Company", "Phone", "Notes", "Registered"];
    const rows = registrations.map((r) => [
      escape(r.name),
      escape(r.email),
      escape(r.company ?? ""),
      escape(r.phone ?? ""),
      escape(r.notes ?? ""),
      escape(formatDate(r.createdAt)),
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signups-${tripForRegistrations.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewRegistrations = async (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    setTripForRegistrations(trip);
    setShowRegistrationsModal(true);
    setLoadingRegistrations(true);
    setRegistrations([]);
    try {
      const res = await fetch(`/api/trip-registrations?tripId=${trip._id}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Company Visits</h1>
        <Button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span>Add Trip</span>
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
                          onClick={(e) => handleViewRegistrations(trip, e)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View sign-ups"
                        >
                          <Users className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(trip)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(trip._id);
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trip-is-online"
              checked={formData.isOnline}
              onChange={(e) => {
                const isOnline = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  isOnline,
                  location: isOnline ? "Online" : prev.location === "Online" ? "" : prev.location,
                }));
              }}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="trip-is-online" className="text-sm font-medium text-gray-900">
              Online trip
            </label>
          </div>

          <Input
            label="Location *"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={formData.isOnline ? "Online" : "e.g., Fremont, CA"}
            disabled={formData.isOnline}
            required={!formData.isOnline}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the visit"
            rows={3}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Image (optional)</label>
            {selectedImageFile || formData.imageUrl ? (
              <div className="relative inline-block">
                <img
                  src={imagePreviewUrl || formData.imageUrl}
                  alt="Trip"
                  className="max-h-40 rounded-xl border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageFile(null);
                    setFormData((prev) => ({ ...prev, imageUrl: "" }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <FileUpload
                onFileSelect={setSelectedImageFile}
                accept="image/jpeg,image/png,image/webp,image/gif"
                maxSize={5 * 1024 * 1024}
                label="Upload image (JPEG, PNG, WebP, GIF — max 5MB)"
              />
            )}
          </div>

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

      {/* Registrations list modal */}
      <Modal
        isOpen={showRegistrationsModal}
        onClose={() => {
          setShowRegistrationsModal(false);
          setTripForRegistrations(null);
          setRegistrations([]);
        }}
        title={tripForRegistrations ? `Sign-ups — ${tripForRegistrations.companyName}` : "Sign-ups"}
        size="xl"
      >
        <div className="min-h-[200px]">
          {loadingRegistrations ? (
            <p className="text-gray-500 py-8 text-center">Loading...</p>
          ) : registrations.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No sign-ups yet for this event.</p>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button variant="secondary" size="sm" onClick={exportRegistrationsToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel
                </Button>
              </div>
              <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Company</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Notes</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-900">{r.name}</td>
                      <td className="py-3 px-2 text-gray-600">{r.email}</td>
                      <td className="py-3 px-2 text-gray-600">{r.company || "—"}</td>
                      <td className="py-3 px-2 text-gray-600">{r.phone || "—"}</td>
                      <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate" title={r.notes || ""}>{r.notes || "—"}</td>
                      <td className="py-3 px-2 text-gray-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
