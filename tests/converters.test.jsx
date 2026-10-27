import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import ImageToPdf from '../src/pages/convertor/ImageToPdf';
import WordToPdf from '../src/pages/convertor/WordToPdf';
import PdfToWord from '../src/pages/convertor/PdfToWord';
import PdfToImage from '../src/pages/convertor/PdfToImage';
import PdfToText from '../src/pages/convertor/PdfToText';
import JpgToPng from '../src/pages/convertor/JpgToPng';
import PngToJpg from '../src/pages/convertor/PngToJpg';
import ExcelToPdf from '../src/pages/convertor/ExcelToPdf';
import PdfToExcel from '../src/pages/convertor/PdfToExcel';

describe('All Converter Tools Pages', () => {
  it('ImageToPdf renders and handles image selection', () => {
    renderWithProviders(<ImageToPdf />);
    expect(screen.getByRole('heading', { name: /^image to pdf$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose image or take photo/i)).toBeInTheDocument();
  });

  it('WordToPdf renders file upload input and convert button', () => {
    renderWithProviders(<WordToPdf />);
    expect(screen.getByRole('heading', { name: /^word to pdf$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose word file/i)).toBeInTheDocument();
  });

  it('PdfToWord renders file picker and instructions', () => {
    renderWithProviders(<PdfToWord />);
    expect(screen.getByRole('heading', { name: /^pdf to word$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose pdf file/i)).toBeInTheDocument();
  });

  it('PdfToImage renders format options and page density selector', () => {
    renderWithProviders(<PdfToImage />);
    expect(screen.getByRole('heading', { name: /^pdf to images$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose pdf file/i)).toBeInTheDocument();
  });

  it('PdfToText renders file input and text extraction area', () => {
    renderWithProviders(<PdfToText />);
    expect(screen.getByRole('heading', { name: /^pdf to text$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose pdf file/i)).toBeInTheDocument();
  });

  it('JpgToPng renders client-side image converter controls', () => {
    renderWithProviders(<JpgToPng />);
    expect(screen.getByRole('heading', { name: /^jpg to png$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose jpg image/i)).toBeInTheDocument();
  });

  it('PngToJpg renders client-side image converter controls', () => {
    renderWithProviders(<PngToJpg />);
    expect(screen.getByRole('heading', { name: /^png to jpg$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose png image/i)).toBeInTheDocument();
  });

  it('ExcelToPdf renders spreadsheet upload controls', () => {
    renderWithProviders(<ExcelToPdf />);
    expect(screen.getByRole('heading', { name: /^excel to pdf$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose excel file/i)).toBeInTheDocument();
  });

  it('PdfToExcel renders tabular conversion controls', () => {
    renderWithProviders(<PdfToExcel />);
    expect(screen.getByRole('heading', { name: /^pdf to excel$/i })).toBeInTheDocument();
    expect(screen.getByText(/choose pdf file/i)).toBeInTheDocument();
  });
});
