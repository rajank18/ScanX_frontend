import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import Redact from '../src/pages/Redact';
import FileShare from '../src/pages/FileShare';
import MetadataRemover from '../src/pages/MetadataRemover';
import Home from '../src/pages/Home';

describe('New Distinct Features Suite', () => {
  describe('Smart PII Redactor Page', () => {
    it('renders heading, PII detection options, and custom keywords input', () => {
      renderWithProviders(<Redact />);
      expect(screen.getByRole('heading', { level: 1, name: /smart pii redactor/i })).toBeInTheDocument();
      expect(screen.getByText(/aadhaar card numbers/i)).toBeInTheDocument();
      expect(screen.getByText(/pan card numbers/i)).toBeInTheDocument();
      expect(screen.getByText(/email addresses/i)).toBeInTheDocument();
      expect(screen.getByText(/phone numbers/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/john doe, secret project/i)).toBeInTheDocument();
    });

    it('handles file selection and enables the redact action button', async () => {
      renderWithProviders(<Redact />);
      const fileInput = document.getElementById('redact-dropzone');
      expect(fileInput).toBeInTheDocument();

      const testFile = new File(['sample content with aadhaar 2345 6789 0123'], 'id_card.pdf', {
        type: 'application/pdf',
      });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(screen.getByText('id_card.pdf')).toBeInTheDocument();
      const redactButton = screen.getByRole('button', { name: /redact & sanitize document/i });
      expect(redactButton).toBeInTheDocument();
      expect(redactButton).not.toBeDisabled();
    });
  });

  describe('Zero-Hassle File Sharer Page', () => {
    it('renders 100MB limit banner, title, and expiration selectors', () => {
      renderWithProviders(<FileShare />);
      expect(screen.getByRole('heading', { level: 1, name: /zero-hassle file sharer/i })).toBeInTheDocument();
      expect(screen.getByText(/100mb limit/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /24 hours/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1 hour/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /7 days/i })).toBeInTheDocument();
    });

    it('handles file selection and allows switching link expiration', () => {
      renderWithProviders(<FileShare />);
      const fileInput = document.getElementById('fileshare-dropzone');
      expect(fileInput).toBeInTheDocument();

      const testFile = new File(['binary payload'], 'project_archive.zip', {
        type: 'application/zip',
      });
      fireEvent.change(fileInput, { target: { files: [testFile] } });

      expect(screen.getByText('project_archive.zip')).toBeInTheDocument();
      const oneHourBtn = screen.getByRole('button', { name: /1 hour/i });
      fireEvent.click(oneHourBtn);

      const generateBtn = screen.getByRole('button', { name: /generate instant share link/i });
      expect(generateBtn).toBeInTheDocument();
      expect(generateBtn).not.toBeDisabled();
    });
  });

  describe('Metadata & AI Tag Remover Page', () => {
    it('renders heading and upload dropzone', () => {
      renderWithProviders(<MetadataRemover />);
      expect(screen.getByRole('heading', { level: 1, name: /metadata & ai tag remover/i })).toBeInTheDocument();
      expect(screen.getByText(/upload pdf or image to anonymize/i)).toBeInTheDocument();
    });

    it('handles file selection and displays strip metadata action button', async () => {
      renderWithProviders(<MetadataRemover />);
      const fileInput = document.getElementById('metadata-dropzone');
      expect(fileInput).toBeInTheDocument();

      const testImage = new File(['image bytes'], 'ai_render.png', {
        type: 'image/png',
      });
      fireEvent.change(fileInput, { target: { files: [testImage] } });

      expect(screen.getByText('ai_render.png')).toBeInTheDocument();
      const stripBtn = screen.getByRole('button', { name: /strip all metadata & anonymize file/i });
      expect(stripBtn).toBeInTheDocument();
      expect(stripBtn).not.toBeDisabled();
    });
  });

  describe('Home Page Feature Discovery', () => {
    it('renders the 3 new distinct feature cards on the homepage grid', () => {
      renderWithProviders(<Home />);
      expect(screen.getByRole('link', { name: /pii redactor/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /file sharer/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /metadata & ai stripper/i })).toBeInTheDocument();
    });
  });
});
