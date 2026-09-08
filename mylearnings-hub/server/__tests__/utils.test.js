import { describe, it, expect } from 'vitest';

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

describe('parseBookTitle', () => {
  it('should parse PDF filename correctly', () => {
    expect(parseBookTitle('my-book-name.pdf')).toBe('My Book Name');
  });

  it('should parse EPUB filename correctly', () => {
    expect(parseBookTitle('another-book.epub')).toBe('Another Book');
  });

  it('should handle single word titles', () => {
    expect(parseBookTitle('cookbook.pdf')).toBe('Cookbook');
  });

  it('should handle multiple hyphens', () => {
    expect(parseBookTitle('the-ultimate-guide-to-cooking.epub')).toBe('The Ultimate Guide To Cooking');
  });

  it('should capitalize first letter of each word', () => {
    expect(parseBookTitle('a-b-c.pdf')).toBe('A B C');
  });
});

describe('getCategoryFromPath', () => {
  it('should extract category from path', () => {
    expect(getCategoryFromPath('/app/cookbooks/italian/book.pdf')).toBe('italian');
  });

  it('should extract category from nested path', () => {
    expect(getCategoryFromPath('/Users/ahmed/cookbooks/french/desserts/book.epub')).toBe('french');
  });

  it('should return unknown for invalid path', () => {
    expect(getCategoryFromPath('/some/path/book.pdf')).toBe('unknown');
  });

  it('should return unknown for path without category', () => {
    expect(getCategoryFromPath('/cookbooks/book.pdf')).toBe('book.pdf');
  });

  it('should handle paths with backslashes', () => {
    const path = 'C:\\app\\cookbooks\\asian\\book.pdf';
    const result = getCategoryFromPath(path);
    expect(result).toBe('C:\\app\\cookbooks\\asian\\book.pdf');
  });
});
