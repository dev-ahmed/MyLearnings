import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface EPUBViewerProps {
  url: string;
  bookId?: string;
}

const API_BASE = window.location.hostname === 'localhost' || window.location.port === '5173'
  ? 'http://localhost:8700/api/progress'
  : '/api/progress';

const EPUBViewer = ({ url, bookId }: EPUBViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!viewerRef.current || !bookId) return;

    const loadProgress = async () => {
      try {
        const res = await fetch(`${API_BASE}/books`);
        const rows = await res.json();
        const saved = rows.find((r: any) => r.item_text === bookId);
        return saved;
      } catch (e) {
        console.error('Failed to load progress', e);
        return null;
      }
    };

    const setupBook = async () => {
      const newBook = ePub(url);
      const savedProgress = await loadProgress();

      const newRendition = newBook.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
      });

      if (savedProgress?.cfi) {
        newRendition.display(savedProgress.cfi);
      } else {
        newRendition.display();
      }

      setRendition(newRendition);

      newRendition.on('relocated', (location: any) => {
        const percentage = Math.round((location.start.percentage || 0) * 100);
        setProgress(percentage);

        saveProgress(location.start.cfi, percentage);
      });
    };

    setupBook();

    return () => {
      rendition?.destroy();
    };
  }, [url, bookId]);

  const saveProgress = async (cfi: string, percentage: number) => {
    if (!bookId) return;

    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: 'books',
          itemText: bookId,
          completed: percentage >= 95,
          progressPercentage: percentage,
          cfi
        })
      });
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        rendition?.prev();
      } else if (e.key === 'ArrowRight') {
        rendition?.next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rendition]);

  const nextPage = () => rendition?.next();
  const prevPage = () => rendition?.prev();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 px-6 py-3 flex gap-4 items-center justify-between border-b border-gray-700">
        <button
          onClick={prevPage}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ← Previous
        </button>
        {progress > 0 && (
          <div className="text-white text-sm font-mono">
            Progress: {progress}%
          </div>
        )}
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
