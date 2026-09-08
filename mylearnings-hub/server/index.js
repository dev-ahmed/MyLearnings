import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8650;

app.use(cors());
app.use(express.json());

const COOKBOOKS_PATH = process.env.NODE_ENV === 'production'
  ? '/app/cookbooks'
  : join(__dirname, '..', '..', 'cookbooks');

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
      const basePath = process.env.NODE_ENV === 'production' ? '/app' : join(__dirname, '..', '..');
      const relativePath = fullPath.replace(basePath, '');

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

    const basePath = process.env.NODE_ENV === 'production' ? '/app' : join(__dirname, '..', '..');
    const fullPath = join(basePath, path);

    if (!fullPath.startsWith(basePath)) {
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

app.use(express.static(join(__dirname, '..', 'dist')));

app.use((req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Books viewer running on http://localhost:${PORT}`);
});
