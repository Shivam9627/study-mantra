import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import axios from "axios";

import featured1 from "../assets/featured1.jpeg";
import featured2 from "../assets/featured2.jpeg";
import featured3 from "../assets/featured3.jpeg";

export default function Featured() {
  const fallback = [
    {
      img: featured1,
      title: "Computer Networks Notes",
      desc: "Well-structured BCA Semester 4 notes with easy explanations.",
      btn: "Download PDF",
    },
    {
      img: featured2,
      title: "Operating System Notes",
      desc: "Detailed OS concepts for BCA students with diagrams.",
      btn: "Download PDF",
    },
    {
      img: featured3,
      title: "DBMS Notes",
      desc: "Database Management System notes with solved examples.",
      btn: "Download PDF",
    },
  ];

  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const API = import.meta.env.VITE_API_URL;
    const res = await axios.get(`${API}/api/docs?type=notes`);
    const list = Array.isArray(res.data) ? res.data : [];
    const bySubject = [];
    const seen = new Set();
    for (const d of list) {
      const key = (d.subject || d.title || "").toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        bySubject.push(d);
      }
      if (bySubject.length >= 3) break;
    }
    const docs = (bySubject.length ? bySubject : list).slice(0, 3);
    setItems(docs);
      } catch {
        setItems([]);
      } finally {
        // no-op
      }
    };
    fetchFeatured();
  }, []);

  const hasUploads = useMemo(() => items.length > 0, [items]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center">Featured Study Materials</h2>

      <div className="grid md:grid-cols-3 gap-10 mt-12">
        {(hasUploads ? items : fallback).map((item, i) => (
          <Motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-white shadow-lg rounded-2xl overflow-hidden"
          >
            <img src={hasUploads ? (item.previewImg || [featured1, featured2, featured3][i % 3]) : item.img} loading="lazy" decoding="async" className="w-full h-52 object-cover" />

            <div className="p-5">
              <h3 className="text-xl font-bold">{hasUploads ? item.title : item.title}</h3>
              <p className="text-gray-600 mt-2">
                {hasUploads
                  ? `${item.subject || ""} • ${item.course || ""} • ${item.college || ""}`
                  : item.desc}
              </p>
              {hasUploads && item.description && (
                <p className="text-gray-500 mt-1 text-sm">{item.description}</p>
              )}

              {hasUploads ? (
                <div className="mt-4 flex gap-2">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        const res = await axios.get(item.fileUrl, { responseType: "blob" });
                        const blob = new Blob([res.data], { type: "application/pdf" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${item.title || "material"}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch {
                        const a = document.createElement("a");
                        a.href = item.fileUrl;
                        a.download = `${item.title || "material"}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              ) : (
                <button className="mt-4 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Download Locked
                </button>
              )}
            </div>
          </Motion.div>
        ))}
      </div>
    </section>
  );
}
