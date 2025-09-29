import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Scan from './pages/Scan.jsx'
import PdfCompress from './pages/PdfCompress.jsx'
import ImageCompress from './pages/ImageCompress.jsx'
import PdfMerge from './pages/PdfMerge.jsx'
// import MergePdf from './pages/MergePdf.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'scan', element: <Scan /> },
      { path: 'pdf-compress', element: <PdfCompress /> },
      { path: 'image-compress', element: <ImageCompress /> },
      { path: 'merge-pdf', element: <PdfMerge /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
