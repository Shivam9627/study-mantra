import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import RatingStars from "../components/RatingStars";
// removed unused notesImg
import featured1 from "../assets/featured1.jpeg";
import featured2 from "../assets/featured2.jpeg";
import featured3 from "../assets/featured3.jpeg";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    college: "",
    course: "",
    semester: "",
    subject: "",
  });
  const [query, setQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");
  const location = useLocation();

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/docs?type=notes`
        );

        if (Array.isArray(res.data)) {
          setNotes(res.data);
        } else {
          setNotes([]);
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    setQuery(q);
  }, [location.search]);

  // Filter logic
  const items = useMemo(() => {
    return notes.filter((item) => {
      if (filters.college && item.college !== filters.college) return false;
      if (filters.course && item.course !== filters.course) return false;
      if (filters.semester && item.semester !== filters.semester) return false;
      if (filters.subject && item.subject !== filters.subject) return false;

      if (
        query &&
        !item.title.toLowerCase().includes(query.toLowerCase()) &&
        !item.subject.toLowerCase().includes(query.toLowerCase())
      )
        return false;

      return true;
    });
  }, [notes, filters, query]);

  const colleges = useMemo(() => Array.from(new Set(notes.map((i) => i.college).filter(Boolean))), [notes]);
  const courses = useMemo(() => Array.from(new Set(notes.map((i) => i.course).filter(Boolean))), [notes]);
  const semesters = useMemo(() => Array.from(new Set(notes.map((i) => i.semester).filter(Boolean))), [notes]);
  const subjects = useMemo(() => Array.from(new Set(notes.map((i) => i.subject).filter(Boolean))), [notes]);

  const viewDoc = async (url) => {
    try {
      if (window.innerWidth >= 1024) {
        const res = await axios.get(url, { responseType: "blob" });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else {
        const res = await axios.get(url, { responseType: "blob" });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setViewerSrc(blobUrl);
        setViewerOpen(true);
      }
    } catch (err) {
      if (!err) return;
      if (window.innerWidth >= 1024) {
        window.open(url, "_blank");
      } else {
        setViewerSrc(url);
        setViewerOpen(true);
      }
    }
  };

  const downloadDoc = async (title, url) => {
    try {
      const res = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${title || "notes"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (!err) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "notes"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <>
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-12">
        <h1 className="text-3xl font-bold mb-4">Notes</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-3">
          <input
            placeholder="Search title or subject..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 rounded flex-1"
          />

          <select
            value={filters.college}
            onChange={(e) =>
              setFilters({ ...filters, college: e.target.value })
            }
            className="border p-2 rounded w-44"
          >
            <option value="">All colleges</option>
            {colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.course}
            onChange={(e) =>
              setFilters({ ...filters, course: e.target.value })
            }
            className="border p-2 rounded w-44"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.semester}
            onChange={(e) =>
              setFilters({ ...filters, semester: e.target.value })
            }
            className="border p-2 rounded w-36"
          >
            <option value="">Semester</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value })
            }
            className="border p-2 rounded w-44"
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-600">
            Loading notes...
          </div>
        )}

        {/* Notes Grid */}
        {!loading && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {items.length === 0 ? (
              <div className="col-span-3 text-center text-gray-600 py-10">
                No notes found.
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow">
                  
                  <img
                    src={[featured1, featured2, featured3][idx % 3]}
                    className="w-full h-40 object-cover rounded-md"
                    alt="Preview"
                  />

                  <h2 className="font-semibold text-lg mt-3">{item.title}</h2>

                  <div className="flex items-center gap-3 mt-2">
                    <RatingStars initialRating={item.avgRating || 0} onRate={async (value) => {
                      try {
                        const headers = { "Content-Type": "application/json" };
                        headers["x-user-id"] = "dev-user";
                        headers["x-user-email"] = "dev@example.com";
                        headers["x-user-name"] = "Dev User";
                        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/docs/${item._id}/rate`, { value }, { headers });
                        setNotes((prev) => prev.map((d) => d._id === item._id ? res.data.document : d));
                      } catch (err) { if (!err) return; }
                    }} />
                    <span className="text-sm text-gray-500">
                      ({item.ratingsCount || 0})
                    </span>
                  </div>

                  <p className="text-sm mt-2">
                    By <span className="font-semibold">{item.contributor?.name}</span>
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.college} • {item.course} • Sem {item.semester}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => viewDoc(item.fileUrl)} className="btn-primary">View</button>
                    <button onClick={() => downloadDoc(item.title, item.fileUrl)} className="btn-outline">Download</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {viewerOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[90vw] h-[80vh] rounded-xl overflow-hidden shadow-lg">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <div className="font-semibold">Document Viewer</div>
              <button className="btn-ghost" onClick={() => { setViewerOpen(false); setViewerSrc(""); }}>Close</button>
            </div>
            <iframe src={viewerSrc} className="w-full h-full" />
          </div>
        </div>
      )}

    </>
  );
}
