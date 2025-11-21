import React from "react";
import { Link } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 px-6">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">StudyMantra</h2>
          <p className="mt-3 text-sm">
            We make study simple and accessible for college students, scholars and teachers.
          </p>
          <p className="mt-2 text-sm">
            Access real notes and previous year papers with dynamic filters, view PDFs in-browser, and download clean copies.
          </p>
          <p className="mt-2 text-sm">
            Use our AI Study Assistant to get structured answers and guidance for your topics and doubts.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2 mt-3">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/notes" className="hover:text-white">Notes</Link></li>
            <li><Link to="/papers" className="hover:text-white">Previous Papers</Link></li>
            <SignedIn>
              <li><Link to="/upload" className="hover:text-white">Upload</Link></li>
              <li><Link to="/my-uploads" className="hover:text-white">My Uploads</Link></li>
            </SignedIn>
            <li><Link to="/chat" className="hover:text-white">AI Study Assistant</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-white">Contact</h3>
          <p className="mt-3 text-sm">Email: studymantra@gmail.com</p>
          <p className="text-sm mt-1">Support available 24/7</p>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center text-gray-500 mt-10 text-sm">
        © 2025 StudyMantra — All Rights Reserved.
      </p>

      {/* Made With Love Line */}
      <p className="text-center text-gray-400 text-sm mt-2 tracking-wide">
        Made with <span className="text-red-500">❤️</span> by <span className="font-semibold text-white">Shivam Chamoli</span>
      </p>
    </footer>
  );
}
