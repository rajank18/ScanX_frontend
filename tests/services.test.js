import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiBaseUrl, buildApiUrl, apiFetch } from '../src/lib/api';
import { cn } from '../src/lib/utils';

describe('Frontend Services & Utilities', () => {
  describe('api.js Service', () => {
    const originalEnv = import.meta.env.VITE_API_URL;

    afterEach(() => {
      import.meta.env.VITE_API_URL = originalEnv;
      vi.restoreAllMocks();
    });

    it('getApiBaseUrl defaults to http://localhost:5000', () => {
      delete import.meta.env.VITE_API_URL;
      expect(getApiBaseUrl()).toBe('http://localhost:5000');
    });

    it('getApiBaseUrl strips trailing slashes from custom VITE_API_URL', () => {
      import.meta.env.VITE_API_URL = 'https://api.goscanx.com///';
      expect(getApiBaseUrl()).toBe('https://api.goscanx.com');
    });

    it('buildApiUrl normalizes leading slashes correctly', () => {
      delete import.meta.env.VITE_API_URL;
      expect(buildApiUrl('scan')).toBe('http://localhost:5000/scan');
      expect(buildApiUrl('/merge/merge')).toBe('http://localhost:5000/merge/merge');
    });

    it('apiFetch performs successful network fetch', async () => {
      const mockResponse = new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const res = await apiFetch('/health');
      expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:5000/health', {});
      expect(res.status).toBe(200);
    });

    it('apiFetch throws helpful error when backend is offline (TypeError)', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(apiFetch('/health')).rejects.toThrow(
        /Cannot connect to API server at http:\/\/localhost:5000/
      );
    });
  });

  describe('utils.js (cn helper)', () => {
    it('merges class names and handles conditional classes', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('px-2', false && 'hidden', true && 'py-4')).toBe('px-2 py-4');
    });

    it('resolves conflicting tailwind classes cleanly', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });
});
