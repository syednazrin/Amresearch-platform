"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Users, Plus, Trash2, Shield, User } from "lucide-react";

interface User {
  _id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    isAdmin: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ email: "", password: "", name: "", isAdmin: false });
        setIsAddingUser(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl md:text-6xl font-extralight text-black tracking-tighter mb-4">Users</h1>
          <div className="w-24 h-px bg-black mb-4"></div>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setIsAddingUser(!isAddingUser)}
          className="px-6 py-3 bg-black text-white text-xs tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Add User Form */}
      {isAddingUser && (
        <div className="border border-gray-200 p-6 bg-gray-50">
          <h2 className="text-xl font-light text-black mb-6 tracking-tight">Create New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="user@aminvest.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAdmin"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isAdmin" className="text-sm text-gray-700">
                Grant admin privileges
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-black text-white text-xs tracking-[0.3em] uppercase hover:bg-gray-800 transition-colors font-bold disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingUser(false);
                  setFormData({ email: "", password: "", name: "", isAdmin: false });
                }}
                className="px-6 py-3 border border-gray-300 text-black text-xs tracking-[0.3em] uppercase hover:border-black transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div>
        <div className="border border-gray-200">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
            <div className="col-span-4">
              <p className="text-xs font-semibold text-black tracking-wider uppercase">User</p>
            </div>
            <div className="col-span-3">
              <p className="text-xs font-semibold text-black tracking-wider uppercase">Email</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-black tracking-wider uppercase">Role</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-black tracking-wider uppercase">Created</p>
            </div>
            <div className="col-span-1">
              <p className="text-xs font-semibold text-black tracking-wider uppercase text-right">Actions</p>
            </div>
          </div>

          {/* Users Rows */}
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-600">No users found</p>
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user._id}
                className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== users.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {user.isSuperAdmin ? (
                      <Shield className="w-5 h-5 text-black" />
                    ) : user.isAdmin ? (
                      <Shield className="w-5 h-5 text-gray-600" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-light text-black">{user.name || "Unnamed User"}</p>
                  </div>
                </div>

                <div className="col-span-3 flex items-center">
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                <div className="col-span-2 flex items-center">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-gray-100 text-gray-700">
                    {user.isSuperAdmin ? "Super Admin" : user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>

                <div className="col-span-2 flex items-center">
                  <p className="text-xs text-gray-500 tracking-wider uppercase">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  {!user.isSuperAdmin && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
