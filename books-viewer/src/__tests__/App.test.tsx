import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

const mockBooks = [
  {
    title: 'PDF Book',
    category: 'languages',
    format: 'pdf',
    path: '/cookbooks/languages/python/pdf-book.pdf',
    filename: 'pdf-book.pdf',
  },
  {
    title: 'EPUB Book',
    category: 'languages',
    format: 'epub',
    path: '/cookbooks/languages/python/epub-book.epub',
    filename: 'epub-book.epub',
  },
  {
    title: 'Lonely EPUB',
    category: 'infrastructure',
    format: 'epub',
    path: '/cookbooks/infrastructure/n8n/lonely.epub',
    filename: 'lonely.epub',
  },
];

global.fetch = vi.fn();

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => mockBooks,
    } as Response);
  });

  it('lists EPUBs only, never a PDF as its own card', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('EPUB Book')).toBeInTheDocument();
    });

    expect(screen.getByText('Lonely EPUB')).toBeInTheDocument();
    expect(screen.queryByText('PDF Book')).not.toBeInTheDocument();
  });

  it('offers print and download for an EPUB that has a PDF beside it', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('EPUB Book')).toBeInTheDocument();
    });

    const expected = `/books/api/books/file?path=${encodeURIComponent(
      '/cookbooks/languages/python/pdf-book.pdf'
    )}`;

    expect(screen.getByRole('link', { name: /Print/ })).toHaveAttribute(
      'href',
      expected
    );
    expect(screen.getByRole('link', { name: /PDF/ })).toHaveAttribute(
      'download',
      'pdf-book.pdf'
    );
  });

  it('omits the PDF actions when no PDF sits beside the EPUB', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Lonely EPUB')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('link', { name: /Print/ })).toHaveLength(1);
  });

  it('renders header with title', () => {
    render(<App />);

    expect(screen.getByText('MyLearnings Books')).toBeInTheDocument();
  });
});
