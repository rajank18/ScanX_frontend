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
            <h1 className="sm:mt-1 md:mt-0">ScanX</h1>
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
            <Link className="hover:text-white" to="/convertor">Convertors</Link>
            <Link className="hover:text-white" to="/colab-to-pdf">Colab Link to PDF</Link>
            <Link className="hover:text-white" to="/scan">Doc Enhancer</Link>
            <Link className="hover:text-white" to="/compress">Compressor</Link>
            <Link className="hover:text-white" to="/merge-pdf">Merge PDFs</Link>
            <Link className="hover:text-white" to="/viewer">Viewer</Link>
          </nav>

          {/* Mobile nav dropdown */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-black/90 border-b border-white/10 md:hidden">
              <nav className="flex flex-col gap-2 p-4 text-sm text-white/80">
                <Link className="hover:text-white py-1" to="/compress" onClick={() => setIsMenuOpen(false)}>Compressor</Link>
                <Link className="hover:text-white py-1" to="/colab-to-pdf" onClick={() => setIsMenuOpen(false)}>Colab Link to PDF</Link>
                <Link className="hover:text-white py-1" to="/scan" onClick={() => setIsMenuOpen(false)}>Doc Enhancer</Link>
                <Link className="hover:text-white py-1" to="/merge-pdf" onClick={() => setIsMenuOpen(false)}>Merge PDFs</Link>
                <Link className="hover:text-white py-1" to="/viewer" onClick={() => setIsMenuOpen(false)}>Viewer</Link>
                <Link className="hover:text-white py-1" to="/convertor" onClick={() => setIsMenuOpen(false)}>Convertors</Link>
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
        <div className="container-narrow font-extrabold">Made By <a href="https://github.com/rajank18">RAJAN❤︎</a></div>
      </footer>
    </div>
  );
}

export default App;
