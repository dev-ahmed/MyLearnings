import { useState, useEffect } from 'react';
import { Book } from './types';
import BookGrid from './components/BookGrid';
import BookViewer from './components/BookViewer';

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'epub'>('all');

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const filteredBooks = books.filter(book =>
    filter === 'all' || book.format === filter
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">MyLearnings Books</h1>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pdf')}
              className={`px-4 py-2 rounded ${filter === 'pdf' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              PDF
            </button>
            <button
              onClick={() => setFilter('epub')}
              className={`px-4 py-2 rounded ${filter === 'epub' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              EPUB
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookGrid books={filteredBooks} onBookSelect={setSelectedBook} />
      </main>

      {selectedBook && (
        <BookViewer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default App;
