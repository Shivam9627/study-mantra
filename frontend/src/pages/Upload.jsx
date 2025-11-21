import React, { useState } from "react";
import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

export default function Upload() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    college: "",
    course: "",
    semester: "",
    subject: "",
    type: "notes",
    session: "",
    description: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        alert("API is not configured. Please set VITE_API_URL in frontend .env.");
        return;
      }

      if (!formData.file) {
        alert("Please select a PDF file to upload.");
        return;
      }

      const fd = new FormData();
      fd.append("college", formData.college);
      fd.append("course", formData.course);
      fd.append("semester", formData.semester);
      fd.append("subject", formData.subject);
      fd.append("type", formData.type);
      if (formData.type === "paper") {
        if (!formData.session) {
          alert("Please select a session for Previous Year Paper.");
          setSubmitting(false);
          return;
        }
        fd.append("session", formData.session);
      }
      fd.append("description", formData.description);
      // Optional: title; backend will fallback to subject or filename
      fd.append("title", formData.subject || formData.file.name);
      fd.append("file", formData.file);

      const headers = { "Content-Type": "multipart/form-data" };

      // Try Clerk token for Authorization
      try {
        const token = await getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        if (!err) return;
      }

      // Always include dev fallback headers as safety net
      headers["x-user-id"] = user?.id || "dev-user";
      headers["x-user-email"] = user?.primaryEmailAddress?.emailAddress || "dev@example.com";
      headers["x-user-name"] = user?.fullName || "Dev User";

      const res = await axios.post(`${API_URL}/api/docs/upload`, fd, { headers });

      if (res.data?.document) {
        alert("Upload successful! Your document is now available.");
        setFormData({
          college: "",
          course: "",
          semester: "",
          subject: "",
          type: "notes",
          session: "",
          description: "",
          file: null,
        });
        const fileInput = document.querySelector('input[type="file"][name="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        alert("Upload completed, but server did not return the document object.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        err?.response?.data?.message ||
          "Upload failed. Please try again or check your connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 w-full flex justify-center px-4 py-10 bg-gray-50 min-h-screen">

      {/* -------- NOT LOGGED IN -------- */}
      <SignedOut>
        <div className="text-center py-40">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Please login to upload documents
          </h2>
          <p className="text-gray-600">You must be authenticated to continue.</p>
        </div>
      </SignedOut>

      {/* -------- LOGGED IN -------- */}
      <SignedIn>
        {/* Clerk loads user async → prevent undefined crash */}
        {!isLoaded || !user ? (
          <div className="text-center py-40 text-xl font-semibold">
            Loading...
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Upload Notes / Papers
            </h2>

            {/* USER DETAILS */}
            <p className="text-gray-700 mb-4 text-center">
              Logged in as:{" "}
              <span className="font-semibold">{user.fullName}</span> ({
                user.primaryEmailAddress.emailAddress
              })
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Contributor Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Contributor Name
                </label>
                <input
                  type="text"
                  value={user.fullName}
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.primaryEmailAddress.emailAddress}
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="College name"
                  required
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. BCA, B.Tech"
                  required
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="1–8"
                  min="1"
                  max="8"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Subject name"
                  required
                />
              </div>

              {/* Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="notes">Notes</option>
              <option value="paper">Previous Year Paper</option>
            </select>
          </div>

          {formData.type === "paper" && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Session (mandatory)
              </label>
              <select
                name="session"
                value={formData.session}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select session</option>
                {Array.from({ length: (new Date().getFullYear() + 1) - 2016 }, (_, i) => 2016 + i)
                  .map((start) => `${start}-${start + 1}`)
                  .map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
              </select>
            </div>
          )}

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Write something..."
                ></textarea>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Upload PDF
                </label>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        )}
      </SignedIn>
    </div>
  );
}
