import { Book } from '../types';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    languages: 'bg-gradient-to-br from-blue-600 to-blue-700',
    infrastructure: 'bg-gradient-to-br from-green-600 to-green-700',
    'ai-and-ml': 'bg-gradient-to-br from-purple-600 to-purple-700',
  };
  return colors[category] || 'bg-gradient-to-br from-gray-600 to-gray-700';
};

const BookGrid = ({ books, onBookSelect }: BookGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <div
          key={index}
          className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 transition-all duration-300 border border-gray-700 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 flex flex-col"
        >
          <div className={`h-48 ${getCategoryColor(book.category)} rounded-lg mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
            <span className="text-6xl transform group-hover:scale-110 transition-transform">📚</span>
          </div>
          <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">{book.title}</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400 capitalize group-hover:text-gray-300 transition-colors">{book.category.replace(/-/g, ' ')}</span>
            <span className="text-xs bg-gray-700 group-hover:bg-gray-600 px-3 py-1 rounded-full uppercase font-medium transition-colors">{book.format}</span>
          </div>
          <button
            onClick={() => onBookSelect(book)}
            className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-900/50 flex items-center justify-center gap-2"
          >
            Read Now →
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
