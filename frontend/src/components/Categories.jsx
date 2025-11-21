import React from "react";
import { motion as Motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

import notes from "../assets/notes.jpeg";
import papers from "../assets/papers.jpeg";
import upload from "../assets/upload.jpeg";
import featured3 from "../assets/featured3.jpeg";

export default function Categories() {
  const { isSignedIn } = useUser();

  // base items
  const items = [
    { title: "Notes", img: notes, link: "/notes" },
    { title: "Previous Papers", img: papers, link: "/papers" },
    { title: "AI Study Assistant", img: featured3, link: "/chat" },
  ];

  // add Upload only if logged in
  if (isSignedIn) {
    items.push({
      title: "Upload Material",
      img: upload,
      link: "/upload",
    });
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">

      {/* Heading */}
      <h2 className="text-3xl font-bold text-center">Study Categories</h2>

      <p className="text-gray-600 text-center mt-2 max-w-2xl mx-auto">
        Access notes, previous year papers or upload your own study materials.
      </p>

      {/* Cards Grid */}
      <div
  className={`grid gap-8 mt-12 ${
    isSignedIn ? "md:grid-cols-3" : "md:grid-cols-2"
  }`}
>
  {items.map((c, i) => (
    <Motion.a
      key={i}
      whileHover={{ scale: 1.05 }}
      href={c.link}
      className="bg-white shadow-lg rounded-xl overflow-hidden"
    >
      <img 
        src={c.img} 
        loading="lazy"
        decoding="async"
        className="w-full h-56 object-cover"
      />
      <div className="p-6 font-semibold">        {/* ⬅️ more padding */}
        {c.title}
      </div>
    </Motion.a>
  ))}
</div>

    </section>
  );
}
