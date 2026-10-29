import { Link } from "react-router-dom";

import SEO from "@/components/SEO";
import {
  ArrowsLeftRight,
  MagicWand,
  FileMagnifyingGlass,
  FileArchive,
  Files,
  FileCode,
} from "@phosphor-icons/react";
import PageInfoSection from "@/components/PageInfoSection";
import MicroSlats from "@/components/ui/MicroSlats";

function FeatureCard({ to, title, subtitle, icon }) {
  return (
    <Link
      to={to}
      className="no-slat-effect group relative w-full aspect-square max-w-[170px] sm:max-w-[210px] md:max-w-[230px] rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center border border-white/15 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-emerald-500/20 bg-black cursor-pointer select-none"
      style={{ backgroundColor: "#000000" }}
      aria-label={title}
    >
      <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/10 group-hover:bg-white/15 group-hover:scale-105 transition-all duration-300 flex items-center justify-center border border-white shadow-sm shrink-0">
        {icon}
      </div>
      <div className="text-center mt-2 sm:mt-3 w-full px-1 flex flex-col items-center justify-center">
        <div className="text-xs sm:text-sm md:text-base font-semibold tracking-wide text-white transition-colors truncate w-full text-center">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] sm:text-xs text-white/60 mt-0.5 md:mt-1 truncate w-full text-center">
            {subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <SEO
        title="Free Online PDF & Image Converter, OCR Scanner & Compression Tool"
        description="ScanX Toolkit offers free online tools for OCR scanning, PDF conversion, image compression, and file merging. Convert images to PDF, compress files, merge PDFs, and more - all in your browser!"
        keywords="scanx, scanx toolkit, pdf converter, image to pdf, ocr scanner, pdf compression, merge pdf, image compressor, word to pdf, pdf to word, online pdf tools"
        canonical="/"
      />

      {/* MicroSlats Background for Homepage only */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <MicroSlats
          preset="swell"
          color="#10b981"
          glintColor="#ffffff"
          backgroundColor="#071311"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          interactive
          cursorStrength={1}
          cursorSize={40}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
          scale={1.5}
          speed={0.6}
          direction={250}
          chop={0.55}
          stretch={0}
          glint={0.7}
          contrast={1.25}
          perspective={0.55}
          fog={0.55}
          introDuration={1.5}
          paused={false}
        />
      </div>

      <div className="w-full relative z-10">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight">ScanX Toolkit</h1>
          <p className="mt-2 md:mt-3 text-white/70 text-sm md:text-base">Fast, private, mobile-first utilities for PDF & image conversion</p>
        </div>

        {/* 2 columns on phone/mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 justify-items-center items-center">
          <FeatureCard
            to="/convertor"
            title="Ultimate Converter"
            subtitle="All file conversions in one place"
            icon={<ArrowsLeftRight size={32} weight="duotone" className="text-white" />}
          />
          <FeatureCard
            to="/scan"
            title="Doc Enhancer"
            subtitle="Photo → Clean PDF/PNG"
            icon={<MagicWand size={32} weight="duotone" className="text-white" />}
          />
          <FeatureCard
            to="/viewer"
            title="Ultimate Viewer"
            subtitle="View PDF/DOCX/Excel"
            icon={<FileMagnifyingGlass size={32} weight="duotone" className="text-white" />}
          />

          <FeatureCard
            to="/compress"
            title="Compressor"
            subtitle="Compress PDF & Images"
            icon={<FileArchive size={32} weight="duotone" className="text-white" />}
          />
          <FeatureCard
            to="/merge-pdf"
            title="Merge PDFs"
            subtitle="Combine multiple"
            icon={<Files size={32} weight="duotone" className="text-white" />}
          />
          <FeatureCard
            to="/colab-to-pdf"
            title="Colab Link to PDF"
            subtitle="Google Colab Link → PDF"
            icon={<FileCode size={32} weight="duotone" className="text-white" />}
          />
        </div>

        <PageInfoSection
          aboutTitle="About ScanX Toolkit"
          aboutText="ScanX Toolkit is a free online platform for document processing, including conversion, OCR scanning, compression, PDF merging, and file viewing. Every tool runs in a simple browser workflow so users can quickly upload, process, and download files without installing desktop software."
          howItWorks={[
            "Choose a feature like converter, scanner, compressor, merger, or viewer.",
            "Upload your document or image in the supported format.",
            "Run the process and download the output file instantly.",
          ]}
          faqs={[
            {
              question: "Is ScanX Toolkit free to use?",
              answer: "Yes, all core tools on ScanX Toolkit are available for free in the browser.",
            },
            {
              question: "Which file types are supported?",
              answer: "You can work with popular formats like PDF, JPG, PNG, DOCX, XLSX, and more depending on the selected feature.",
            },
            {
              question: "Do I need to install anything?",
              answer: "No installation is required. You can use all features directly online.",
            },
          ]}
        />
      </div>
    </>
  )
};

