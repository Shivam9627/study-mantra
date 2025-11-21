import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import RatingStars from "../components/RatingStars";
// removed unused papersImg
import featured1 from "../assets/featured1.jpeg";
import featured2 from "../assets/featured2.jpeg";
import featured3 from "../assets/featured3.jpeg";

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    college: "",
    course: "",
    semester: "",
    session: "",
  });
  const [query, setQuery] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/docs?type=paper`);
        setPapers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    setQuery(q);
  }, [location.search]);

  const colleges = useMemo(() => Array.from(new Set(papers.map((i) => i.college).filter(Boolean))), [papers]);
  const courses = useMemo(() => Array.from(new Set(papers.map((i) => i.course).filter(Boolean))), [papers]);
  const semesters = useMemo(() => Array.from(new Set(papers.map((i) => i.semester).filter(Boolean))), [papers]);
  const sessions = useMemo(() => Array.from(new Set(papers.map((i) => i.session).filter(Boolean))), [papers]);

  const items = useMemo(() => {
    return papers.filter((item) => {
      if (filters.college && item.college !== filters.college) return false;
      if (filters.course && item.course !== filters.course) return false;
      if (filters.semester && item.semester !== filters.semester) return false;
      if (filters.session && item.session !== filters.session) return false;
      if (query && !item.title?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [papers, filters, query]);

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
      a.download = `${title || "paper"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (!err) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "paper"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <div className="pt-24 max-w-7xl mx-auto px-6 pb-12">
      <h1 className="text-3xl font-bold mb-4">Previous Year Papers</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-3">
        <input
          placeholder="Search title..."
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
          onChange={(e) => setFilters({ ...filters, course: e.target.value })}
          className="border p-2 rounded w-44"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.session}
          onChange={(e) => setFilters({ ...filters, session: e.target.value })}
          className="border p-2 rounded w-44"
        >
          <option value="">Session</option>
          {sessions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.semester}
          onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          className="border p-2 rounded w-36"
        >
          <option value="">Semester</option>
          {semesters.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Papers Grid */}
      {loading && (
        <div className="text-center py-12 text-gray-600">Loading papers...</div>
      )}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
        {items.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-10">No papers found.</div>
        )}
        {items.length > 0 && items.map((item, idx) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-lg shadow flex gap-4"
          >
            <img
              src={[featured1, featured2, featured3][idx % 3]}
              alt=""
              className="w-40 h-28 object-cover rounded-md"
            />

            <div className="flex-1">
              <h2 className="font-semibold">{item.title}</h2>

              <div className="flex items-center gap-3 mt-2">
                <RatingStars initialRating={item.avgRating || 0} onRate={async (value) => {
                  try {
                    const headers = { "Content-Type": "application/json" };
                    headers["x-user-id"] = "dev-user";
                    headers["x-user-email"] = "dev@example.com";
                    headers["x-user-name"] = "Dev User";
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/docs/${item._id}/rate`, { value }, { headers });
                    setPapers((prev) => prev.map((d) => d._id === item._id ? res.data.document : d));
                  } catch (err) { if (!err) return; }
                }} />
                <span className="text-sm text-gray-500">
                  ({item.ratingsCount || 0})
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                By <span className="font-semibold">{item.contributor?.name}</span> • {item.college}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {item.course} | Sem {item.semester} • Year {item.year}
              </p>

              <div className="mt-4 flex gap-2">
                <button onClick={() => viewDoc(item.fileUrl)} className="btn-primary">View</button>
                <button onClick={() => downloadDoc(item.title, item.fileUrl)} className="btn-outline">Download</button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

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
    </div>
  );
}
