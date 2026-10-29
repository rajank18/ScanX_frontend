import { Link } from "react-router-dom";
import { CometCard } from "@/components/ui/comet-card";
import SEO from "@/components/SEO";
import scanIcon from "../assets/scan.png";
import pdfCompressIcon from "../assets/pdfcompress.png";
import imgCompressIcon from "../assets/imgcompress.png";
import viewer from "../assets/viewer.jpg";
import mergeIcon from "../assets/merge.png";
import { useState } from "react";
import PageInfoSection from "@/components/PageInfoSection";

function FeatureCard({ to, title, subtitle, icon }) {
  return (
    <CometCard>
      <Link
        to={to}
        className="group relative w-[280px] max-w-[200px] aspect-square flex items-center justify-center transition-transform hover:-translate-y-0.5"
        aria-label={title}
      >
        <div
          className="card w-full h-full rounded-[16px] p-3 md:p-5 flex flex-col items-center justify-center"
          style={{ background: "#102d25ff" }}
        >
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-white flex items-center justify-center border border-white/15">
            {icon}
          </div>
          <div className="text-center mt-2 md:mt-3">
            <div className="text-sm md:text-lg font-semibold">{title}</div>
            {subtitle && (
              <div className="text-xs text-white/60 mt-1 md:text-sm">{subtitle}</div>
            )}
          </div>
        </div>
      </Link>
    </CometCard>
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
      <div className="w-full">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight">ScanX Toolkit</h1>
          <p className="mt-2 md:mt-3 text-white/70 text-sm md:text-base">Fast, private, mobile-first utilities for PDF & image conversion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 place-items-center">
          <FeatureCard
            to="/convertor"
            title="Ultimate Converter"
            subtitle="All file conversions in one place"
            icon={<img src={mergeIcon} alt="Ultimate Converter" className="w-8 h-8 md:w-12 md:h-12" />}
          />
          <FeatureCard to="/scan" title="Doc Enhancer" subtitle="Photo → Clean PDF/PNG" icon={<img src={scanIcon} alt="Doc Enhancer" className="w-8 h-8 md:w-12 md:h-12" />} />
          <FeatureCard to="/viewer" title="Ultimate Viewer" subtitle="View PDF/DOCX/Excel" icon={<img src={viewer} alt="Ultimate Viewer" className="w-8 h-8 md:w-12 md:h-12" />} />

          <FeatureCard to="/compress" title="Compressor" subtitle="Compress PDF & Images" icon={<img src={pdfCompressIcon} alt="Compressor" className="w-8 h-8 md:w-12 md:h-12" />} />
          <FeatureCard to="/merge-pdf" title="Merge PDFs" subtitle="Combine multiple" icon={<img src={mergeIcon} alt="Merge PDFs" className="w-8 h-8 md:w-12 md:h-12" />} />
          <FeatureCard
            to="/colab-to-pdf"
            title="Colab to PDF"
            subtitle="Google Colab / IPYNB → PDF"
            icon={
              <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 32 32" fill="none">
                <path d="M11 9C7.686 9 5 11.686 5 15s2.686 6 6 6c2.25 0 4.218-1.24 5.25-3.08A6.002 6.002 0 0 1 21 21c3.314 0 6-2.686 6-6s-2.686-6-6-6c-2.25 0-4.218 1.24-5.25 3.08A6.002 6.002 0 0 1 11 9Z" stroke="#F9AB00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="15" r="2.5" fill="#F9AB00" />
                <circle cx="21" cy="15" r="2.5" fill="#E37400" />
              </svg>
            }
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

