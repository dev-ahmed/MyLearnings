import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookGrid from '../BookGrid';
import { Book } from '../../types';

const mockBooks: Book[] = [
  {
    title: 'Test Book 1',
    category: 'languages',
    format: 'pdf',
    path: '/cookbooks/languages/test-book-1.pdf',
    filename: 'test-book-1.pdf',
  },
  {
    title: 'Test Book 2',
    category: 'infrastructure',
    format: 'epub',
    path: '/cookbooks/infrastructure/test-book-2.epub',
    filename: 'test-book-2.epub',
  },
];

describe('BookGrid', () => {
  it('renders all books', () => {
    const onBookSelect = vi.fn();
    render(<BookGrid books={mockBooks} onBookSelect={onBookSelect} />);

    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
  });

  it('displays book categories and formats', () => {
    const onBookSelect = vi.fn();
    render(<BookGrid books={mockBooks} onBookSelect={onBookSelect} />);

    expect(screen.getByText('languages')).toBeInTheDocument();
    expect(screen.getByText('infrastructure')).toBeInTheDocument();
    expect(screen.getByText('pdf')).toBeInTheDocument();
    expect(screen.getByText('epub')).toBeInTheDocument();
  });

  it('calls onBookSelect when book is clicked', async () => {
    const user = userEvent.setup();
    const onBookSelect = vi.fn();
    render(<BookGrid books={mockBooks} onBookSelect={onBookSelect} />);

    await user.click(screen.getByText('Test Book 1'));
    expect(onBookSelect).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('renders empty grid when no books', () => {
    const onBookSelect = vi.fn();
    const { container } = render(<BookGrid books={[]} onBookSelect={onBookSelect} />);

    expect(container.querySelector('.grid')?.children.length).toBe(0);
  });
});
