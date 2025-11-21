import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Papers from "./pages/Papers";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyUploads from "./pages/MyUploads";
import AiChat from "./pages/AiChat";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-uploads" element={<MyUploads />} />
        <Route path="/chat" element={<AiChat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      <Footer />
    </>
  );
}
