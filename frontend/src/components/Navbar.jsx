import React, { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState("notes");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b transition-all duration-300
        ${
          isScrolled
            ? "bg-white/85 shadow-md border-gray-200"
            : "bg-black/40 border-white/10"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
          <h1
            className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
          >
            StudyMantra
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          <Link
            to="/"
            className={`transition-colors duration-300 ${
              isScrolled
                ? "text-gray-800 hover:text-indigo-600"
                : "text-white hover:text-indigo-300"
            }`}
          >
            Home
          </Link>

          <Link
            to="/notes"
            className={`transition-colors duration-300 ${
              isScrolled
                ? "text-gray-800 hover:text-indigo-600"
                : "text-white hover:text-indigo-300"
            }`}
          >
            Notes
          </Link>

          <Link
            to="/papers"
            className={`transition-colors duration-300 ${
              isScrolled
                ? "text-gray-800 hover:text-indigo-600"
                : "text-white hover:text-indigo-300"
            }`}
          >
            Papers
          </Link>

          {/* Upload visible only when signed in */}
          <SignedIn>
            <Link
              to="/upload"
              className={`transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-800 hover:text-indigo-600"
                  : "text-white hover:text-indigo-300"
              }`}
            >
              Upload
            </Link>
            <Link
              to="/my-uploads"
              className={`transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-800 hover:text-indigo-600"
                  : "text-white hover:text-indigo-300"
              }`}
            >
              My Uploads
            </Link>
          </SignedIn>

          <Search
            size={20}
            className={`cursor-pointer ${
              isScrolled ? "text-gray-800" : "text-white"
            }`}
            onClick={() => setSearchOpen(true)}
          />

          {/* AUTH BUTTONS */}
          <SignedOut>
            <SignInButton>
              <button
                className={`px-4 py-1.5 rounded-md font-medium transition ${
                  isScrolled
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? (
            <X
              size={24}
              className={`${isScrolled ? "text-gray-800" : "text-white"}`}
            />
          ) : (
            <Menu
              size={24}
              className={`${isScrolled ? "text-gray-800" : "text-white"}`}
            />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t py-3 px-6 space-y-2 shadow-lg">

          <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-100">Home</Link>
          <Link to="/notes" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-100">Notes</Link>
          <Link to="/papers" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-100">Papers</Link>

          <SignedIn>
            <Link to="/upload" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-100">Upload</Link>
            <Link to="/my-uploads" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-100">My Uploads</Link>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className="w-full py-2 bg-indigo-600 text-white rounded-md">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="px-3"><UserButton /></div>
          </SignedIn>

        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-24">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-4 mx-4">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search notes or papers..."
                className="border flex-1 p-2 rounded"
              />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border p-2 rounded w-32"
              >
                <option value="notes">Notes</option>
                <option value="paper">Papers</option>
              </select>
              <button
                className="btn-primary"
                onClick={() => {
                  if (searchType === "notes") navigate(`/notes?query=${encodeURIComponent(searchText)}`);
                  else navigate(`/papers?query=${encodeURIComponent(searchText)}`);
                  setSearchOpen(false);
                }}
              >
                Search
              </button>
              <button className="btn-ghost" onClick={() => setSearchOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Motion.nav>
  );
}
