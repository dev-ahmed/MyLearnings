import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readdir: vi.fn(),
      readFile: vi.fn(),
    },
  };
});

const parseBookTitle = (filename) => {
  return filename
    .replace(/\.(pdf|epub)$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryFromPath = (path) => {
  const parts = path.split('/');
  const categoryIndex = parts.findIndex(p => p === 'cookbooks') + 1;
  return parts[categoryIndex] || 'unknown';
};

const findAllBooks = async (dir, books = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await findAllBooks(fullPath, books);
    } else if (entry.name.endsWith('.pdf') || entry.name.endsWith('.epub')) {
      const format = entry.name.endsWith('.pdf') ? 'pdf' : 'epub';
      const relativePath = fullPath.replace(join(__dirname, '..', '..', '..'), '');

      books.push({
        title: parseBookTitle(entry.name),
        category: getCategoryFromPath(fullPath),
        format,
        path: relativePath,
        filename: entry.name,
      });
    }
  }

  return books;
};

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const COOKBOOKS_PATH = join(__dirname, '..', '..', 'cookbooks');

  app.get('/api/books', async (req, res) => {
    try {
      const books = await findAllBooks(COOKBOOKS_PATH);
      res.json(books);
    } catch (error) {
      console.error('Error reading books:', error);
      res.status(500).json({ error: 'Failed to load books' });
    }
  });

  app.get('/api/books/file', async (req, res) => {
    try {
      const { path } = req.query;
      if (!path) {
        return res.status(400).json({ error: 'Path is required' });
      }

      const fullPath = join(__dirname, '..', '..', '..', path);

      if (!fullPath.startsWith(join(__dirname, '..', '..', '..'))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const fileBuffer = await fs.readFile(fullPath);
      const ext = path.endsWith('.pdf') ? 'pdf' : 'epub';
      const contentType = ext === 'pdf' ? 'application/pdf' : 'application/epub+zip';

      res.setHeader('Content-Type', contentType);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(404).json({ error: 'File not found' });
    }
  });

  return app;
};

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/books', () => {
    it('returns list of books', async () => {
      const mockEntries = [
        { name: 'test-book.pdf', isDirectory: () => false },
        { name: 'another-book.epub', isDirectory: () => false },
      ];

      fs.readdir.mockResolvedValue(mockEntries);

      const response = await request(app).get('/api/books');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('handles errors gracefully', async () => {
      fs.readdir.mockRejectedValue(new Error('Read error'));

      const response = await request(app).get('/api/books');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to load books' });
    });
  });

  describe('GET /api/books/file', () => {
    it('returns 400 when path is missing', async () => {
      const response = await request(app).get('/api/books/file');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Path is required' });
    });

    it('returns 403 for paths outside allowed directory', async () => {
      const response = await request(app)
        .get('/api/books/file')
        .query({ path: '../../../etc/passwd' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access denied' });
    });

    it('returns 404 when file does not exist', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/books/file')
        .query({ path: '/cookbooks/test.pdf' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'File not found' });
    });

    it('serves PDF file with correct content type', async () => {
      const mockBuffer = Buffer.from('PDF content');
      fs.readFile.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/books/file')
        .query({ path: '/cookbooks/test.pdf' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('serves EPUB file with correct content type', async () => {
      const mockBuffer = Buffer.from('EPUB content');
      fs.readFile.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/books/file')
        .query({ path: '/cookbooks/test.epub' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/epub+zip');
    });
  });

  describe('parseBookTitle', () => {
    it('converts filename to title', () => {
      expect(parseBookTitle('test-book.pdf')).toBe('Test Book');
      expect(parseBookTitle('another-example.epub')).toBe('Another Example');
    });
  });

  describe('getCategoryFromPath', () => {
    it('extracts category from path', () => {
      expect(getCategoryFromPath('/some/path/cookbooks/languages/book.pdf')).toBe('languages');
      expect(getCategoryFromPath('/cookbooks/infrastructure/book.epub')).toBe('infrastructure');
    });

    it('returns unknown for invalid paths', () => {
      expect(getCategoryFromPath('/invalid/path')).toBe('unknown');
    });
  });
});
