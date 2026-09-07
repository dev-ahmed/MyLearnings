import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const mockBooks = [
  {
    title: 'PDF Book',
    category: 'languages',
    format: 'pdf',
    path: '/cookbooks/languages/pdf-book.pdf',
    filename: 'pdf-book.pdf',
  },
  {
    title: 'EPUB Book',
    category: 'infrastructure',
    format: 'epub',
    path: '/cookbooks/infrastructure/epub-book.epub',
    filename: 'epub-book.epub',
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

  it('fetches and displays books', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('PDF Book')).toBeInTheDocument();
      expect(screen.getByText('EPUB Book')).toBeInTheDocument();
    });
  });

  it('filters books by format', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('PDF Book')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'PDF' }));

    expect(screen.getByText('PDF Book')).toBeInTheDocument();
    expect(screen.queryByText('EPUB Book')).not.toBeInTheDocument();
  });

  it('shows all books when All filter is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('PDF Book')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'EPUB' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByText('PDF Book')).toBeInTheDocument();
    expect(screen.getByText('EPUB Book')).toBeInTheDocument();
  });

  it('renders header with title', () => {
    render(<App />);

    expect(screen.getByText('MyLearnings Books')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EPUB' })).toBeInTheDocument();
  });
});
