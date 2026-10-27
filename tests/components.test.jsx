import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { renderWithProviders } from './test-utils';
import SEO from '../src/components/SEO';
import ImageUpload from '../src/components/ImageUpload';
import ScanPreview from '../src/components/ScanPreview';
import PageInfoSection from '../src/components/PageInfoSection';
import { AuroraBackground } from '../src/components/ui/aurora-background';
import { CometCard } from '../src/components/ui/comet-card';

describe('Frontend Shared Components', () => {
  describe('SEO Component', () => {
    it('renders helmet metadata without crashing and sets canonical URL with new domain', async () => {
      renderWithProviders(
        <SEO
          title="PDF Compressor"
          description="Compress PDF easily"
          canonical="/pdf-compress"
        />
      );

      await waitFor(() => {
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        expect(canonicalLink).toHaveAttribute('href', 'https://goscanx.vercel.app/pdf-compress');
        const metaDesc = document.querySelector('meta[name="description"]');
        expect(metaDesc).toHaveAttribute('content', 'Compress PDF easily');
      });
    });
  });

  describe('ImageUpload Component', () => {
    it('renders file input and triggers onImageSelect callback when file is picked', () => {
      const onImageSelect = vi.fn();
      render(<ImageUpload onImageSelect={onImageSelect} />);

      const input = screen.getByLabelText(/choose image or take photo/i);
      expect(input).toBeInTheDocument();

      const testFile = new File(['dummy image content'], 'test.png', { type: 'image/png' });
      fireEvent.change(input, { target: { files: [testFile] } });

      expect(onImageSelect).toHaveBeenCalledWith(testFile);
    });
  });

  describe('ScanPreview Component', () => {
    it('returns null when scannedBlobUrl is empty', () => {
      const { container } = render(<ScanPreview scannedBlobUrl={null} format="png" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders image and PNG download button when format is png', () => {
      render(<ScanPreview scannedBlobUrl="blob:mock-png-url" format="png" />);
      expect(screen.getByText(/scanned image/i)).toBeInTheDocument();
      const downloadLink = screen.getByRole('link', { name: /download png/i });
      expect(downloadLink).toHaveAttribute('href', 'blob:mock-png-url');
      expect(downloadLink).toHaveAttribute('download', 'scanned.png');
    });

    it('renders PDF download button when format is pdf', () => {
      render(<ScanPreview scannedBlobUrl="blob:mock-pdf-url" format="pdf" />);
      expect(screen.getByText(/scanned pdf/i)).toBeInTheDocument();
      const downloadLink = screen.getByRole('link', { name: /download pdf/i });
      expect(downloadLink).toHaveAttribute('href', 'blob:mock-pdf-url');
      expect(downloadLink).toHaveAttribute('download', 'scanned.pdf');
    });
  });

  describe('PageInfoSection Component', () => {
    it('renders custom title, instructions, and FAQ questions and answers', () => {
      const steps = ['Step 1: Upload file', 'Step 2: Click convert'];
      const faqs = [{ question: 'Is it free?', answer: 'Yes, 100% free forever.' }];

      render(
        <PageInfoSection
          aboutTitle="About PDF Tool"
          aboutText="Convert and manage documents quickly."
          howItWorks={steps}
          faqs={faqs}
        />
      );

      expect(screen.getByText('About PDF Tool')).toBeInTheDocument();
      expect(screen.getByText('Convert and manage documents quickly.')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Upload file')).toBeInTheDocument();
      expect(screen.getByText('Is it free?')).toBeInTheDocument();
      expect(screen.getByText('Yes, 100% free forever.')).toBeInTheDocument();
    });
  });

  describe('UI Effects (AuroraBackground & CometCard)', () => {
    it('renders AuroraBackground with children', () => {
      render(
        <AuroraBackground>
          <div>Aurora Child Content</div>
        </AuroraBackground>
      );
      expect(screen.getByText('Aurora Child Content')).toBeInTheDocument();
    });

    it('renders CometCard with children', () => {
      render(
        <CometCard>
          <div>Card Inner Content</div>
        </CometCard>
      );
      expect(screen.getByText('Card Inner Content')).toBeInTheDocument();
    });
  });
});
