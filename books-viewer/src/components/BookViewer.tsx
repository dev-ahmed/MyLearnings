import { Book } from '../types';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';

interface BookViewerProps {
  book: Book;
  onClose: () => void;
}

const BookViewer = ({ book, onClose }: BookViewerProps) => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold">{book.title}</h2>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 text-white font-medium transition-all"
        >
          ← Back to Library
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {book.format === 'pdf' ? (
          <PDFViewer url={`/books/api/books/file?path=${encodeURIComponent(book.path)}`} />
        ) : (
          <EPUBViewer url={`/books/api/books/file?path=${encodeURIComponent(book.path)}`} />
        )}
      </div>
    </div>
  );
};

export default BookViewer;
