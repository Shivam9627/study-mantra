import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "../lib/auth.jsx";
import { API_URL } from "../config/api.js";

const splitEmails = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export default function AdminPanel() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [warningText, setWarningText] = useState({});

  const adminEmails = useMemo(
    () => splitEmails(import.meta.env.VITE_ADMIN_EMAILS),
    []
  );

  const isAdminUser = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    return (
      !!user &&
      (!!user.publicMetadata?.isAdmin || (email && adminEmails.includes(email)))
    );
  }, [user, adminEmails]);

  const buildHeaders = async () => {
    const headers = {};
    try {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.warn("Failed to acquire Clerk token:", err.message);
    }

    if (user) {
      headers["x-user-id"] = user.id;
      headers["x-user-email"] = user.primaryEmailAddress?.emailAddress || "dev@example.com";
      headers["x-user-name"] = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin";
    }

    if (isAdminUser) headers["x-user-admin"] = "true";
    return headers;
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const headers = await buildHeaders();
      const [docsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/admin/docs`, { headers }),
        axios.get(`${API_URL}/admin/users`, { headers }),
      ]);
      setDocuments(docsRes.data.documents || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) {
      fetchAdminData();
    }
  }, [isAdminUser]);

  const handleDeleteDoc = async (id) => {
    try {
      const headers = await buildHeaders();
      await axios.delete(`${API_URL}/admin/docs/${id}`, { headers });
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      setAlert({ type: "success", message: "Document removed." });
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || err.message });
    }
  };

  const handleWarning = async (userId) => {
    const message = warningText[userId]?.trim();
    if (!message) return;

    try {
      const headers = await buildHeaders();
      await axios.post(
        `${API_URL}/admin/users/${userId}/warning`,
        { message },
        { headers }
      );
      setAlert({ type: "success", message: "Warning sent to user." });
      setWarningText((prev) => ({ ...prev, [userId]: "" }));
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || err.message });
    }
  };

  const totalWarnings = users.reduce((sum, item) => sum + (item.warnings?.length || 0), 0);
  const paperCount = documents.filter((doc) => doc.type === "paper").length;
  const notesCount = documents.filter((doc) => doc.type !== "paper").length;

  if (!user) {
    return (
      <div className="pt-24 max-w-5xl mx-auto px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Admin access required</h2>
          <p className="text-gray-600">Sign in with an admin account to manage project data.</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="pt-24 max-w-5xl mx-auto px-6">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Access denied</h2>
          <p className="text-gray-700">Your account is not authorized for the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell pt-24 pb-12">
      <div className="surface-card overflow-hidden p-6 sm:p-8">
      <div className="mb-8 rounded-[28px] bg-gradient-to-r from-slate-950 via-indigo-950 to-cyan-950 px-6 py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Moderation dashboard for documents and users</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/85">
            Review uploads, control platform quality, and manage warnings with a cleaner admin experience.
          </p>
        </div>
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            Refresh data
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total documents", value: documents.length, tone: "from-indigo-500/25 to-indigo-400/5" },
            { label: "Notes", value: notesCount, tone: "from-cyan-500/25 to-cyan-400/5" },
            { label: "Papers", value: paperCount, tone: "from-fuchsia-500/25 to-fuchsia-400/5" },
            { label: "Warnings", value: totalWarnings, tone: "from-amber-500/25 to-amber-400/5" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.tone} px-5 py-4 backdrop-blur`}
            >
              <div className="text-sm text-slate-300">{item.label}</div>
              <div className="mt-3 text-3xl font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {alert && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 ${alert.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
          {alert.message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-4">
          <div className="surface-muted p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Documents</h2>
                <p className="text-sm text-gray-600">All uploads available in the system.</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {documents.length} items
              </span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading documents…</div>
              ) : documents.length === 0 ? (
                <div className="text-gray-500">No documents found.</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc._id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">
                          {doc.type || "notes"}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{doc.title || "Untitled"}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          By {doc.contributor?.email || doc.contributor?.name || "unknown"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{doc.course || "Course N/A"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{doc.college || "College N/A"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{doc.session || "Session N/A"}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="surface-muted p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Users</h2>
              <p className="text-sm text-gray-600">View registered users and warnings.</p>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading users…</div>
              ) : users.length === 0 ? (
                <div className="text-gray-500">No users yet.</div>
              ) : (
                users.map((userItem) => (
                  <div key={userItem._id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{userItem.email || userItem.name || "Unknown user"}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Created {new Date(userItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setWarningText((prev) => ({ ...prev, [userItem.clerkId]: "" }))}
                        className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Warn
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-semibold text-slate-700">Send warning to this user</div>
                      <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">
                        Warnings: {userItem.warnings?.length || 0}
                      </div>
                      {userItem.warnings?.length > 0 && (
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                          <div className="mb-2 font-medium text-slate-700">Previous warnings</div>
                          <div className="space-y-2">
                            {userItem.warnings.slice(-2).reverse().map((warning, index) => (
                              <div key={`${userItem._id}-warning-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                <div>{warning.message}</div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {warning.issuedBy || "admin"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <textarea
                        rows={3}
                        value={warningText[userItem.clerkId] || ""}
                        onChange={(e) => setWarningText((prev) => ({ ...prev, [userItem.clerkId]: e.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-500"
                        placeholder="Write a warning message..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleWarning(userItem.clerkId)}
                          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Send warning
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
