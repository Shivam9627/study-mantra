import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, FileText, ShieldCheck, Sparkles } from "lucide-react";
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
      style={{ marginTop: "var(--nav-h)", minHeight: "calc(100vh - var(--nav-h))" }}
    >
      <img
        src={hero}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.38]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-900/70 to-indigo-950/78" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.36),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.20),transparent_24%)]" />

      <div className="section-shell relative flex min-h-[calc(100vh-var(--nav-h))] items-center py-12 sm:py-20">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-left text-white">
            <Motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur"
            >
              <Sparkles size={16} className="text-cyan-300" />
              Smarter notes, cleaner UI, faster study flow
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 max-w-3xl text-5xl font-black leading-tight sm:text-6xl lg:text-7xl"
            >
              Your modern study hub for notes, papers, and AI help.
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/90 sm:text-xl"
            >
              Explore high-quality study material, upload your own documents, and chat with an AI
              assistant that feels focused, structured, and actually useful during revision.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/notes"
                className="inline-flex items-center rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-2xl transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Explore Notes
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center rounded-2xl border border-white/20 bg-indigo-500/70 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Open AI Assistant
              </Link>
            </Motion.div>
          </div>

          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="overflow-hidden rounded-[32px] border border-white/20 bg-slate-950/55 p-6 text-white shadow-[0_24px_60px_rgba(2,6,23,0.35)] backdrop-blur-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">StudyMantra</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Everything in one focused workspace</h2>
              </div>
              <div className="rounded-2xl bg-white/12 p-3">
                <Bot className="text-cyan-200" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: FileText,
                  title: "Curated materials",
                  text: "Notes and previous year papers organized for faster discovery.",
                },
                {
                  icon: Bot,
                  title: "Chat-style AI",
                  text: "Get cleaner answers, summaries, and revision-ready explanations.",
                },
                {
                  icon: ShieldCheck,
                  title: "Admin controls",
                  text: "Manage users and uploaded files with a sharper moderation dashboard.",
                },
                {
                  icon: Sparkles,
                  title: "Responsive design",
                  text: "Modern cards, gradients, and polished spacing across every screen.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-3">
                    <Icon size={18} className="text-cyan-200" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-100/85">{text}</p>
                </div>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}
