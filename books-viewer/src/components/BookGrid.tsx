import { Book } from '../types';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    languages: 'bg-blue-600',
    infrastructure: 'bg-green-600',
    'ai-and-ml': 'bg-purple-600',
  };
  return colors[category] || 'bg-gray-600';
};

const BookGrid = ({ books, onBookSelect }: BookGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <div
          key={index}
          onClick={() => onBookSelect(book)}
          className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <div className={`h-48 ${getCategoryColor(book.category)} rounded-lg mb-4 flex items-center justify-center`}>
            <span className="text-6xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{book.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 capitalize">{book.category.replace('-', ' ')}</span>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded uppercase">{book.format}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
