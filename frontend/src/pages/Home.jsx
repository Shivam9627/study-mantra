import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Featured from "../components/Featured";
import Footer from "../components/Footer";
import featured1 from "../assets/featured1.jpeg";
import featured2 from "../assets/featured2.jpeg";
import featured3 from "../assets/featured3.jpeg";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center">What You Get</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={featured1} className="w-full h-40 object-cover" />
            <div className="p-5">Real notes and papers from your peers with dynamic filters.</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={featured2} className="w-full h-40 object-cover" />
            <div className="p-5">In‑browser PDF viewing and clean downloading.</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={featured3} className="w-full h-40 object-cover" />
            <div className="p-5">New: AI Study Assistant to answer your questions.</div>
          </div>
        </div>
      </section>
    </>
  );
}
