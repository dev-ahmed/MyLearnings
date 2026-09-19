import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface EPUBViewerProps {
  url: string;
  bookId?: string;
}

interface Annotation {
  cfi: string;
  text: string;
  note: string;
  color: string;
}

const API_BASE = window.location.hostname === 'localhost' || window.location.port === '5173'
  ? 'http://localhost:8700/api/progress'
  : '/api/progress';

const EPUBViewer = ({ url, bookId }: EPUBViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedCfi, setSelectedCfi] = useState('');
  const [noteText, setNoteText] = useState('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

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
      if (!viewerRef.current) return;

      const newBook = ePub(url);
      const savedProgress = await loadProgress();
      const savedAnnotations = await loadAnnotations();

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

      // Enable annotations
      newRendition.annotations.add('highlight', 'test', {}, () => {}, 'hl', { fill: 'yellow', 'fill-opacity': 0.3 });

      // Load saved annotations
      savedAnnotations.forEach((ann: Annotation) => {
        newRendition.annotations.add('highlight', ann.cfi, {}, undefined, 'hl', { fill: ann.color || 'yellow', 'fill-opacity': 0.3 });
      });

      // Handle text selection with context menu
      newRendition.on('selected', (cfiRange: string, contents: any) => {
        const selection = contents.window.getSelection();
        const text = selection?.toString() || '';

        if (text.trim()) {
          setSelectedText(text);
          setSelectedCfi(cfiRange);
        }
      });

      // Add right-click context menu after content is rendered
      newRendition.on('rendered', () => {
        const contents = newRendition.getContents();
        const iframeDoc = contents && contents.length > 0 ? (contents as any)[0]?.document : null;

        if (iframeDoc) {
          iframeDoc.addEventListener('contextmenu', (e: MouseEvent) => {
            const selection = iframeDoc.getSelection();
            const text = selection?.toString() || '';

            if (text.trim()) {
              e.preventDefault();

              const iframeRect = (e.target as any).ownerDocument.defaultView.frameElement.getBoundingClientRect();
              setContextMenuPos({
                x: e.clientX + iframeRect.left,
                y: e.clientY + iframeRect.top
              });
              setShowContextMenu(true);
            }
          });
        }
      });

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

  const loadAnnotations = async () => {
    if (!bookId) return;

    try {
      const res = await fetch(`${API_BASE}/books-annotations`);
      const rows = await res.json();
      const bookAnnotations = rows.filter((r: any) => r.item_text === bookId);

      if (bookAnnotations.length > 0 && bookAnnotations[0].annotations) {
        const parsed = JSON.parse(bookAnnotations[0].annotations);
        setAnnotations(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load annotations', e);
    }
    return [];
  };

  const saveAnnotations = async (newAnnotations: Annotation[]) => {
    if (!bookId) return;

    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: 'books-annotations',
          itemText: bookId,
          annotations: JSON.stringify(newAnnotations),
          completed: false
        })
      });
    } catch (e) {
      console.error('Failed to save annotations', e);
    }
  };

  const handleAddNote = () => {
    if (!selectedText || !selectedCfi) return;

    const newAnnotation: Annotation = {
      cfi: selectedCfi,
      text: selectedText,
      note: noteText,
      color: 'yellow'
    };

    const updated = [...annotations, newAnnotation];
    setAnnotations(updated);
    saveAnnotations(updated);

    if (rendition) {
      rendition.annotations.add('highlight', selectedCfi, {}, undefined, 'hl', { fill: 'yellow', 'fill-opacity': 0.3 });
    }

    setShowNoteModal(false);
    setShowContextMenu(false);
    setNoteText('');
    setSelectedText('');
    setSelectedCfi('');
  };

  const handleHighlight = (color: string) => {
    if (!selectedText || !selectedCfi) return;

    const newAnnotation: Annotation = {
      cfi: selectedCfi,
      text: selectedText,
      note: '',
      color
    };

    const updated = [...annotations, newAnnotation];
    setAnnotations(updated);
    saveAnnotations(updated);

    if (rendition) {
      rendition.annotations.add('highlight', selectedCfi, {}, undefined, 'hl', { fill: color, 'fill-opacity': 0.3 });
    }

    setShowContextMenu(false);
    setSelectedText('');
    setSelectedCfi('');
  };

  const handleBookmark = () => {
    if (!selectedCfi) return;

    const newAnnotation: Annotation = {
      cfi: selectedCfi,
      text: selectedText || 'Bookmark',
      note: 'Bookmark',
      color: 'blue'
    };

    const updated = [...annotations, newAnnotation];
    setAnnotations(updated);
    saveAnnotations(updated);

    setShowContextMenu(false);
    setSelectedText('');
    setSelectedCfi('');
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
            Progress: {progress}% · {annotations.length} notes
          </div>
        )}
        <button
          onClick={nextPage}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Next →
        </button>
      </div>
      <div className="flex-1 bg-white overflow-hidden relative" onClick={() => setShowContextMenu(false)}>
        <div ref={viewerRef} className="w-full h-full" />

        {showContextMenu && (
          <div
            className="absolute bg-white shadow-lg rounded-lg border border-gray-300 py-2 z-50"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                setShowNoteModal(true);
                setShowContextMenu(false);
              }}
            >
              <span>📝</span> Add Note
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => handleHighlight('yellow')}
            >
              <span className="inline-block w-4 h-4 bg-yellow-300 rounded"></span> Yellow Highlight
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => handleHighlight('lightgreen')}
            >
              <span className="inline-block w-4 h-4 bg-green-300 rounded"></span> Green Highlight
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => handleHighlight('lightblue')}
            >
              <span className="inline-block w-4 h-4 bg-blue-300 rounded"></span> Blue Highlight
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={handleBookmark}
            >
              <span>🔖</span> Bookmark
            </button>
          </div>
        )}

        {showNoteModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Add Note</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected text:</p>
                <p className="text-sm bg-yellow-100 p-2 rounded border border-yellow-300 italic">
                  "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                </p>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Add your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText('');
                    setSelectedText('');
                    setSelectedCfi('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPUBViewer;
