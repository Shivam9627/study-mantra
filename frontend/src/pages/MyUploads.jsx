import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function MyUploads() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const buildHeaders = async () => {
    const headers = { "Content-Type": "application/json" };
    try {
      const token = await getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch (err) { if (!err) return; }
    headers["x-user-id"] = user?.id || "dev-user";
    headers["x-user-email"] = user?.primaryEmailAddress?.emailAddress || "dev@example.com";
    headers["x-user-name"] = user?.fullName || "Dev User";
    return headers;
  };

  const fetchMyDocs = async () => {
    try {
      setLoading(true);
      const headers = await buildHeaders();
      const res = await axios.get(`${API_URL}/api/docs/user/my`, { headers });
      setDocs(res.data || []);
      setError("");
    } catch (err) {
      console.error("Fetch my docs error:", err);
      setError(err?.response?.data?.message || "Failed to load your uploads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user && API_URL) {
      fetchMyDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  const handleUpdate = async (id, updates) => {
    try {
      setSavingId(id);
      const headers = await buildHeaders();
      const res = await axios.put(`${API_URL}/api/docs/${id}`, updates, { headers });
      setDocs((prev) => prev.map((d) => (d._id === id ? res.data.document : d)));
    } catch (err) {
      console.error("Update doc error:", err);
      alert(err?.response?.data?.message || "Could not update document.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      setDeletingId(id);
      const headers = await buildHeaders();
      await axios.delete(`${API_URL}/api/docs/${id}`, { headers });
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete doc error:", err);
      alert(err?.response?.data?.message || "Could not delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const DocRow = ({ doc }) => {
    const [edit, setEdit] = useState({
      title: doc.title,
      type: doc.type,
      description: doc.description || "",
    });

    return (
      <div className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              className="border px-2 py-1 rounded w-full md:w-64"
              value={edit.title}
              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              placeholder="Title"
            />
            <select
              className="border px-2 py-1 rounded"
              value={edit.type}
              onChange={(e) => setEdit({ ...edit, type: e.target.value })}
            >
              <option value="notes">Notes</option>
              <option value="paper">Previous Year Paper</option>
            </select>
          </div>
          <textarea
            className="border px-2 py-1 rounded w-full mt-2"
            rows={2}
            value={edit.description}
            onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            placeholder="Description"
          />
          <div className="text-sm text-gray-600 mt-2">
            {doc.subject} • {doc.course} • Semester {doc.semester} • {doc.college}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-gray-200 rounded"
          >
            View
          </a>
          <button
            onClick={() => handleUpdate(doc._id, edit)}
            disabled={savingId === doc._id}
            className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
          >
            {savingId === doc._id ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => handleDelete(doc._id)}
            disabled={deletingId === doc._id}
            className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-60"
          >
            {deletingId === doc._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-24 w-full flex justify-center px-4 py-10 bg-gray-50 min-h-screen">
      <SignedOut>
        <div className="text-center py-40">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Please login to manage your uploads</h2>
          <p className="text-gray-600">You must be authenticated to continue.</p>
        </div>
      </SignedOut>

      <SignedIn>
        {!isLoaded || !user ? (
          <div className="text-center py-40 text-xl font-semibold">Loading...</div>
        ) : (
          <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">My Uploads</h2>

            {loading ? (
              <div className="py-20 text-center">Loading your uploads...</div>
            ) : docs.length === 0 ? (
              <div className="py-20 text-center text-gray-700">
                You haven't uploaded anything yet. Please contribute and upload something!
              </div>
            ) : (
              <div className="space-y-4">
                {docs.map((doc) => (
                  <DocRow key={doc._id} doc={doc} />
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 text-center text-red-600">{error}</div>
            )}
          </div>
        )}
      </SignedIn>
    </div>
  );
}