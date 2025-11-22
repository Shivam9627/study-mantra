import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import hero from "../assets/hero.jpeg";

export default function Hero() {
  useEffect(() => {
    const update = () => {
      const navbar = document.querySelector("nav");
      const h = navbar ? navbar.offsetHeight : 0;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section
      className={`relative w-full overflow-hidden`}
      style={{ marginTop: "var(--nav-h)", height: "calc(100vh - var(--nav-h))" }}
    >
      {/* Background Image */}
      <img
        src={hero}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.60]"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">

        <Motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl leading-snug"
        >
          Study Smart, Score Better
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-200 mt-4 text-lg md:text-xl max-w-2xl drop-shadow-lg"
        >
          Get the best notes, previous year papers & study materials for your success.
        </Motion.p>

        <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.07 }}
          >
            <Link to="/notes" className="px-7 py-3.5 bg-indigo-600 text-white text-lg rounded-xl shadow-xl hover:bg-indigo-700">
              Explore Notes
            </Link>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.07 }}
          >
            <Link to="/chat" className="px-7 py-3.5 bg-teal-500 text-white text-lg rounded-xl shadow-xl hover:bg-teal-600">
              Ask AI Chat
            </Link>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}
