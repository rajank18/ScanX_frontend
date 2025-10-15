import React from "react";
import { useNavigate } from "react-router-dom";
import { HoverEffect } from "../components/ui/card-hover-effect";

const conversionOptions = [
  {
    title: "Image to PDF",
    description: "Convert images (JPG, PNG, etc.) to a single PDF file.",
    link: "/convertor/image-to-pdf"
  },
  {
    title: "PDF to Images",
    description: "Extract all images from a PDF file.",
    link: "/convertor/pdf-to-images"
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents to PDF format.",
    link: "/convertor/word-to-pdf"
  },
  {
    title: "PDF to Word",
    description: "Convert PDF files to editable Word documents.",
    link: "/convertor/pdf-to-word"
  },
  {
    title: "JPG to PNG",
    description: "Convert JPG images to PNG format.",
    link: "/convertor/jpg-to-png"
  },
  {
    title: "PNG to JPG",
    description: "Convert PNG images to JPG format.",
    link: "/convertor/png-to-jpg"
  },
  {
    title: "PDF to Text",
    description: "Extract text from PDF files.",
    link: "/convertor/pdf-to-text"
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF format.",
    link: "/convertor/excel-to-pdf"
  },
  {
    title: "PDF to Excel",
    description: "Convert PDF tables to Excel spreadsheets.",
    link: "/convertor/pdf-to-excel"
  },
];

export default function Convertor() {
  return (
    <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md pr-5 pl-6 pt-4 pb-4 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ultimate Converter</h2>
      <p className="text-white/70 ">Select a conversion type below:</p>
      <HoverEffect items={conversionOptions} className="" />
    </div>
  );
}
