import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Featured from "../components/Featured";
import Footer from "../components/Footer";
import { Bot, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import featured1 from "../assets/featured1.jpeg";
import featured2 from "../assets/featured2.jpeg";
import featured3 from "../assets/featured3.jpeg";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <section className="section-shell py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">Platform highlights</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">A cleaner experience across every workflow</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            StudyMantra is designed to feel modern, readable, and efficient whether you are browsing notes, chatting with AI, or managing uploads.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: FileText, title: "Notes library", text: "Discover notes and previous papers in organized, easy-to-scan layouts." },
            { icon: Bot, title: "AI responses", text: "Chat-style answers with cleaner formatting and more readable structure." },
            { icon: LayoutDashboard, title: "Smart admin", text: "A sharper moderation dashboard with clearer hierarchy and controls." },
            { icon: ShieldCheck, title: "Responsive UI", text: "Improved spacing, cards, and mobile-friendly sections throughout the app." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface-card p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="surface-card overflow-hidden">
            <img src={featured1} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900">Real student material</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Real notes and papers from your peers with dynamic filters.
              </p>
            </div>
          </div>
          <div className="surface-card overflow-hidden">
            <img src={featured2} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900">Focused reading flow</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                In-browser PDF viewing and clean downloading for distraction-free study.
              </p>
            </div>
          </div>
          <div className="surface-card overflow-hidden">
            <img src={featured3} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-900">AI study support</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A more modern AI Study Assistant experience for explanations and revisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
