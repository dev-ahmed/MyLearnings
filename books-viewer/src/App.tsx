import { useState, useEffect } from 'react';
import { Book } from './types';
import BookGrid from './components/BookGrid';
import BookViewer from './components/BookViewer';

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'epub'>('all');

  useEffect(() => {
    fetch('/books/api/books')
      .then(res => res.json())
      .then(data => setBooks(Array.isArray(data) ? data : []));
  }, []);

  const filteredBooks = books.filter(book =>
    filter === 'all' || book.format === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📚</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MyLearnings Books</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/50 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pdf')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'pdf'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/50 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              📄 PDF
            </button>
            <button
              onClick={() => setFilter('epub')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'epub'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/50 scale-105'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              📖 EPUB
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooks.length > 0 ? (
          <BookGrid books={filteredBooks} onBookSelect={setSelectedBook} />
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
