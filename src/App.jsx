import { useState } from "react";
import logo from "./assets/logo.png";
import { Outlet, Link } from "react-router-dom";
import "./globals.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black">
        <div className="container-narrow h-14 md:h-16 flex items-center justify-between">
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight flex ">
          <div>
            <img src={logo} className="inline w-max h-8 mr-2 mb-1" alt="ScanX Logo" />
          </div>
          <h1>ScanX</h1>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-3 text-sm md:text-base text-white/80">
            <Link className="hover:text-white" to="/convertors">Convertors</Link>
            <Link className="hover:text-white" to="/scan">Scanner</Link>
            {/* <Link className="hover:text-white" to="/pdf-compress">PDF Compress</Link> */}
            <Link className="hover:text-white" to="/image-compress">Image Compress</Link>
            <Link className="hover:text-white" to="/merge-pdf">Merge PDFs</Link>
          </nav>

          {/* Mobile nav dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-black/90 border-b border-white/10 md:hidden">
              <nav className="flex flex-col gap-2 p-4 text-sm text-white/80">
                <Link className="hover:text-white py-1" to="/scan" onClick={() => setIsMenuOpen(false)}>OCR Scan</Link>
                {/* <Link className="hover:text-white py-1" to="/pdf-compress" onClick={() => setIsMenuOpen(false)}>PDF Compress</Link> */}
                <Link className="hover:text-white py-1" to="/image-compress" onClick={() => setIsMenuOpen(false)}>Image Compress</Link>
                <Link className="hover:text-white py-1" to="/merge-pdf" onClick={() => setIsMenuOpen(false)}>Merge PDFs</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="container-narrow py-8 md:py-12">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-white/10 text-center text-xs text-white/50 py-4">
        <div className="container-narrow font-extrabold">Made By RAJAN❤︎</div>
      </footer>
    </div>
  );
}

export default App;
