import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home.jsx'
import Scan from './pages/Scan.jsx'
import Compressor from './pages/Compressor.jsx'
import PdfMerge from './pages/PdfMerge.jsx'
import Convertor from './pages/Convertor.jsx'
import UltimateViewer from './pages/UltimateViewer.jsx'
import ImageToPdf from './pages/convertor/ImageToPdf.jsx'
import WordToPdf from './pages/convertor/WordToPdf.jsx'
import PdfToWord from './pages/convertor/PdfToWord.jsx'
import PdfToImage from './pages/convertor/PdfToImage.jsx'
import PdfToText from './pages/convertor/PdfToText.jsx'
import JpgToPng from './pages/convertor/JpgToPng.jsx'
import PngToJpg from './pages/convertor/PngToJpg.jsx'
import ExcelToPdf from './pages/convertor/ExcelToPdf.jsx'
import PdfToExcel from './pages/convertor/PdfToExcel.jsx'
import ColabToPdf from './pages/convertor/ColabToPdf.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'scan', element: <Scan /> },
      { path: 'compress', element: <Compressor /> },
      { path: 'pdf-compress', element: <Compressor /> },
      { path: 'image-compress', element: <Compressor /> },
      { path: 'merge-pdf', element: <PdfMerge /> },
      { path: 'convertor', element: <Convertor /> },
      { path: 'viewer', element: <UltimateViewer /> },
      { path: 'convertor/image-to-pdf', element: <ImageToPdf /> },
      { path: 'convertor/word-to-pdf', element: <WordToPdf /> },
      { path: 'convertor/pdf-to-word', element: <PdfToWord /> },
      { path: 'convertor/pdf-to-images', element: <PdfToImage /> },
      { path: 'convertor/pdf-to-text', element: <PdfToText /> },
      { path: 'convertor/jpg-to-png', element: <JpgToPng /> },
      { path: 'convertor/png-to-jpg', element: <PngToJpg /> },
      { path: 'convertor/excel-to-pdf', element: <ExcelToPdf /> },
      { path: 'convertor/pdf-to-excel', element: <PdfToExcel /> },
      { path: 'convertor/colab-to-pdf', element: <ColabToPdf /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
)
