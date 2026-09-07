import { Book } from '../types';
import PDFViewer from './PDFViewer';
import EPUBViewer from './EPUBViewer';

interface BookViewerProps {
  book: Book;
  onClose: () => void;
}

const BookViewer = ({ book, onClose }: BookViewerProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700 text-lg"
            >
              Close
            </button>
          </div>
          {book.format === 'pdf' ? (
            <PDFViewer url={`/api/books/file?path=${encodeURIComponent(book.path)}`} />
          ) : (
            <EPUBViewer url={`/api/books/file?path=${encodeURIComponent(book.path)}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;
