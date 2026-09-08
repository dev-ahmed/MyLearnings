import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface EPUBViewerProps {
  url: string;
}

const EPUBViewer = ({ url }: EPUBViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const newBook = ePub(url);
    const newRendition = newBook.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
    });

    newRendition.display();
    setRendition(newRendition);

    return () => {
      newRendition.destroy();
    };
  }, [url]);

  const nextPage = () => rendition?.next();
  const prevPage = () => rendition?.prev();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 px-6 py-3 flex gap-4 items-center justify-center border-b border-gray-700">
        <button
          onClick={prevPage}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={nextPage}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Next →
        </button>
      </div>
      <div className="flex-1 bg-white overflow-hidden">
        <div ref={viewerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default EPUBViewer;
