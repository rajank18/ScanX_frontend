import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '../src/App';
import Home from '../src/pages/Home';
import Scan from '../src/pages/Scan';
import Compressor from '../src/pages/Compressor';
import PdfCompress from '../src/pages/PdfCompress';
import ImageCompress from '../src/pages/ImageCompress';
import PdfMerge from '../src/pages/PdfMerge';
import Convertor from '../src/pages/Convertor';
import UltimateViewer from '../src/pages/UltimateViewer';
import ImageToPdf from '../src/pages/convertor/ImageToPdf';
import WordToPdf from '../src/pages/convertor/WordToPdf';
import PdfToText from '../src/pages/convertor/PdfToText';
import JpgToPng from '../src/pages/convertor/JpgToPng';
import PngToJpg from '../src/pages/convertor/PngToJpg';
import ExcelToPdf from '../src/pages/convertor/ExcelToPdf';
import PdfToExcel from '../src/pages/convertor/PdfToExcel';
import ColabToPdf from '../src/pages/convertor/ColabToPdf';

function renderFullApp(initialRoute = '/') {
  const routes = [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: 'scan', element: <Scan /> },
        { path: 'doc-enhancer', element: <Scan /> },
        { path: 'compress', element: <Compressor /> },
        { path: 'pdf-compress', element: <Compressor /> },
        { path: 'image-compress', element: <Compressor /> },
        { path: 'merge-pdf', element: <PdfMerge /> },
        { path: 'convertor', element: <Convertor /> },
        { path: 'viewer', element: <UltimateViewer /> },
        { path: 'colab-to-pdf', element: <ColabToPdf /> },
        { path: 'convertor/colab-to-pdf', element: <ColabToPdf /> },
        { path: 'convertor/image-to-pdf', element: <ImageToPdf /> },
        { path: 'convertor/word-to-pdf', element: <WordToPdf /> },
        { path: 'convertor/pdf-to-text', element: <PdfToText /> },
        { path: 'convertor/jpg-to-png', element: <JpgToPng /> },
        { path: 'convertor/png-to-jpg', element: <PngToJpg /> },
        { path: 'convertor/excel-to-pdf', element: <ExcelToPdf /> },
        { path: 'convertor/pdf-to-excel', element: <PdfToExcel /> },
      ],
    },
  ];

  const router = createMemoryRouter(routes, { initialEntries: [initialRoute] });

  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

describe('End-to-End Navigation & Routing', () => {
  it('loads home page by default with header branding and tools', () => {
    renderFullApp('/');
    expect(screen.getByRole('heading', { level: 1, name: /^scanx$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /^scanx toolkit$/i })).toBeInTheDocument();
    expect(screen.getByText(/fast, private, mobile-first utilities/i)).toBeInTheDocument();
  });

  it('navigates seamlessly from Home to Doc Enhancer', async () => {
    renderFullApp('/');
    const enhancerLinks = screen.getAllByRole('link', { name: /doc enhancer/i });
    fireEvent.click(enhancerLinks[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /^doc enhancer$/i })).toBeInTheDocument();
    });
  });

  it('navigates from Home to Compressor', async () => {
    renderFullApp('/');
    const compressLinks = screen.getAllByRole('link', { name: /compressor/i });
    fireEvent.click(compressLinks[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /^universal compressor$/i })).toBeInTheDocument();
    });
  });

  it('navigates from Home to Merge PDFs', async () => {
    renderFullApp('/');
    const mergeLinks = screen.getAllByRole('link', { name: /merge pdf/i });
    fireEvent.click(mergeLinks[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /^merge pdfs$/i })).toBeInTheDocument();
    });
  });

  it('navigates to Convertor and clicks a converter option to open sub-tool', async () => {
    renderFullApp('/convertor');
    expect(screen.getByRole('heading', { level: 2, name: /^ultimate converter$/i })).toBeInTheDocument();

    const imageToPdfLink = screen.getByRole('link', { name: /image to pdf/i });
    fireEvent.click(imageToPdfLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /^image to pdf$/i })).toBeInTheDocument();
    });
  });

  it('toggles mobile menu button and navigates to Viewer', async () => {
    renderFullApp('/');
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    // Dropdown is open, click Viewer
    const viewerLinks = screen.getAllByRole('link', { name: /viewer/i });
    fireEvent.click(viewerLinks[viewerLinks.length - 1]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /^ultimate document viewer$/i })).toBeInTheDocument();
    });
  });

  it('simulates document conversion workflow on PdfToText', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ text: 'Extracted text from test notebook' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    renderFullApp('/convertor/pdf-to-text');

    const fileInput = screen.getByLabelText(/choose pdf file/i);
    const mockPdf = new File(['%PDF-1.4 test'], 'sample1.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [mockPdf] } });

    const extractButton = screen.getByRole('button', { name: /extract text/i });
    fireEvent.click(extractButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('Extracted text from test notebook');
    });
  });
});
