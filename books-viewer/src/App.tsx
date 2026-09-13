import { useState, useEffect } from 'react';
import { Book } from './types';
import BookGrid from './components/BookGrid';
import BookViewer from './components/BookViewer';

const requestedSlug = (): string | null =>
  new URLSearchParams(window.location.search).get('book');

const findBookBySlug = (books: Book[], slug: string): Book | null => {
  const inFolder = books.filter(book => book.path.split('/').includes(slug));

  return inFolder.find(book => book.format === 'epub') ?? inFolder[0] ?? null;
};

const folderOf = (book: Book): string =>
  book.path.slice(0, book.path.lastIndexOf('/'));

const findPdf = (books: Book[], epub: Book): Book | null =>
  books.find(
    book => book.format === 'pdf' && folderOf(book) === folderOf(epub)
  ) ?? null;

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetch('/books/api/books')
      .then(res => res.json())
      .then(data => setBooks(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    const slug = requestedSlug();

    if (!slug || books.length === 0) return;

    setSelectedBook(findBookBySlug(books, slug));
  }, [books]);

  const epubs = books.filter(book => book.format === 'epub');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-gray-600 bg-gray-700/50 text-xs font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-600/20 hover:text-blue-300"
          >
            ← <span>Back to Sprints</span>
          </a>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MyLearnings Books</h1>
          </div>
          <p className="text-sm text-gray-400">
            {epubs.length} cookbooks · read in the browser, or take the PDF to print
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {epubs.length > 0 ? (
          <BookGrid
            books={epubs}
            onBookSelect={setSelectedBook}
            findPdf={epub => findPdf(books, epub)}
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No books found</p>
          </div>
        )}
      </main>

      {selectedBook && (
        <BookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default App;
