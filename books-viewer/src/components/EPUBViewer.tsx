import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface EPUBViewerProps {
  url: string;
}

const EPUBViewer = ({ url }: EPUBViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const newBook = ePub(url);
    const newRendition = newBook.renderTo(viewerRef.current, {
      width: '100%',
      height: 600,
      spread: 'none',
    });

    newRendition.display();
    setBook(newBook);
    setRendition(newRendition);

    return () => {
      newRendition.destroy();
    };
  }, [url]);

  const nextPage = () => rendition?.next();
  const prevPage = () => rendition?.prev();

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 p-4 mb-4 rounded-lg flex gap-4">
        <button
          onClick={prevPage}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Previous
        </button>
        <button
          onClick={nextPage}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
      <div ref={viewerRef} className="border border-gray-700 bg-white" style={{ width: '800px', height: '600px' }} />
    </div>
  );
};

export default EPUBViewer;
