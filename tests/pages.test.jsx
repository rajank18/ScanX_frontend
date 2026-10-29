import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import Home from '../src/pages/Home';
import Scan from '../src/pages/Scan';
import ImageCompress from '../src/pages/ImageCompress';
import PdfCompress from '../src/pages/PdfCompress';
import PdfMerge from '../src/pages/PdfMerge';
import Convertor from '../src/pages/Convertor';
import UltimateViewer from '../src/pages/UltimateViewer';

describe('Frontend Core Pages', () => {
  describe('Home Page', () => {
    it('renders hero title and feature navigation cards', () => {
      renderWithProviders(<Home />);
      expect(screen.getByRole('heading', { level: 1, name: /scanx toolkit/i })).toBeInTheDocument();
      expect(screen.getByText(/ultimate converter/i)).toBeInTheDocument();
      expect(screen.getByText(/camscanner/i)).toBeInTheDocument();
      expect(screen.getByText(/pdf compress/i)).toBeInTheDocument();
      expect(screen.getByText(/image compress/i)).toBeInTheDocument();
      expect(screen.getByText(/merge pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/ultimate viewer/i)).toBeInTheDocument();
    });
  });

  describe('Scan (CamScanner) Page', () => {
    it('renders title and upload field initially', () => {
      renderWithProviders(<Scan />);
      expect(screen.getByRole('heading', { name: /^simple camscanner$/i })).toBeInTheDocument();
      expect(screen.getByText(/choose image or take photo/i)).toBeInTheDocument();
    });

    it('handles image selection, reveals format selector, and allows format switching', () => {
      renderWithProviders(<Scan />);
      const fileInput = screen.getByLabelText(/choose image or take photo/i);
      const testFile = new File(['test image data'], 'sample.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      const select = screen.getByLabelText(/output:/i);
      expect(select.value).toBe('png');

      fireEvent.change(select, { target: { value: 'pdf' } });
      expect(select.value).toBe('pdf');

      // Scan Document button becomes active and visible
      const scanButton = screen.getByRole('button', { name: /scan document/i });
      expect(scanButton).toBeInTheDocument();
    });
  });

  describe('ImageCompress Page', () => {
    it('renders heading and image upload prompt initially', () => {
      renderWithProviders(<ImageCompress />);
      expect(screen.getByRole('heading', { name: /^image compression$/i })).toBeInTheDocument();
      expect(screen.getByText(/choose image or take photo/i)).toBeInTheDocument();
    });

    it('displays quality slider and compress button after selecting an image', () => {
      renderWithProviders(<ImageCompress />);
      const fileInput = screen.getByLabelText(/choose image or take photo/i);
      const testFile = new File(['mock content'], 'test.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(screen.getByText(/quality:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /compress image/i })).toBeInTheDocument();
    });
  });

  describe('PdfCompress Page', () => {
    it('renders PDF compression controls and upload prompt', () => {
      renderWithProviders(<PdfCompress />);
      expect(screen.getByRole('heading', { name: /^pdf compression$/i })).toBeInTheDocument();
      expect(screen.getByText(/choose pdf file/i)).toBeInTheDocument();
    });
  });

  describe('PdfMerge Page', () => {
    it('renders upload area and merge instructions', () => {
      renderWithProviders(<PdfMerge />);
      expect(screen.getByRole('heading', { name: /^merge pdfs$/i })).toBeInTheDocument();
      expect(screen.getByText(/select multiple pdf files/i)).toBeInTheDocument();
    });
  });

  describe('Convertor Hub Page', () => {
    it('renders grid with all converter tool links', () => {
      renderWithProviders(<Convertor />);
      expect(screen.getByRole('heading', { name: /^ultimate converter$/i })).toBeInTheDocument();
      expect(screen.getByText('Image to PDF')).toBeInTheDocument();
      expect(screen.getByText('Word to PDF')).toBeInTheDocument();
      expect(screen.getByText('JPG to PNG')).toBeInTheDocument();
      expect(screen.getByText('PNG to JPG')).toBeInTheDocument();
      expect(screen.getByText('Excel to PDF')).toBeInTheDocument();
      expect(screen.getByText('PDF to Excel')).toBeInTheDocument();
      expect(screen.getByText('PDF to Text')).toBeInTheDocument();
    });
  });

  describe('UltimateViewer Page', () => {
    it('renders document viewer container and file picker', () => {
      renderWithProviders(<UltimateViewer />);
      expect(screen.getByRole('heading', { name: /ultimate document viewer/i })).toBeInTheDocument();
      expect(screen.getByText(/choose a file \(pdf, docx, doc, xlsx, xls\)/i)).toBeInTheDocument();
    });
  });
});
