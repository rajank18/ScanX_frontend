import React from "react";
import { useNavigate } from "react-router-dom";
import { HoverEffect } from "../components/ui/card-hover-effect";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";

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
    <>
      <SEO 
        title="Free File Converter - Convert PDF, Images, Word, Excel Online"
        description="Free online file converter. Convert between PDF, images (JPG, PNG), Word, Excel, and more. Image to PDF, PDF to Word, Excel to PDF, and many more conversions."
        keywords="file converter, pdf converter, image to pdf, word to pdf, pdf to word, excel to pdf, pdf to excel, jpg to png, png to jpg, pdf to text, online converter"
        canonical="/convertor"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md pr-5 pl-6 pt-4 pb-4 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ultimate Converter</h2>
      <p className="text-white/70 ">Select a conversion type below:</p>
      <HoverEffect items={conversionOptions} className="" />
      </div>
      <PageInfoSection
        aboutTitle="About Ultimate Converter"
        aboutText="Ultimate Converter brings multiple document and image conversion workflows into one place. It supports common office and media format changes, making it easier to prepare files for sharing, editing, printing, or archiving."
        howItWorks={[
          "Pick a conversion option from the available tools.",
          "Upload the source file in supported format.",
          "Start conversion and download the processed result.",
        ]}
        faqs={[
          {
            question: "Can I convert both documents and images?",
            answer: "Yes, the converter includes PDF, Word, Excel, JPG, and PNG workflows.",
          },
          {
            question: "Do all converters have the same steps?",
            answer: "Most tools follow the same pattern: upload, convert, and download.",
          },
          {
            question: "Which converter should I choose?",
            answer: "Select the card that matches your source and target formats, for example PDF to Word or JPG to PNG.",
          },
        ]}
      />
    </>
  );
}
