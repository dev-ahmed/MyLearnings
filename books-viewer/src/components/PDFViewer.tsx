import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

const PDFViewer = ({ url }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument({ url });
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
    };
    loadPdf();
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    };

    renderPage();
  }, [pdf, pageNum, scale]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 px-6 py-3 flex gap-4 items-center justify-center border-b border-gray-700">
        <button
          onClick={() => setPageNum(p => Math.max(1, p - 1))}
          disabled={pageNum <= 1}
          className="px-6 py-2 bg-blue-600 rounded-lg disabled:bg-gray-600 disabled:opacity-50 hover:bg-blue-700 transition-colors font-medium"
        >
          ← Previous
        </button>
        <span className="px-4 py-2 bg-gray-700 rounded-lg font-medium min-w-[150px] text-center">
          Page {pageNum} of {numPages}
        </span>
        <button
          onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
          disabled={pageNum >= numPages}
          className="px-6 py-2 bg-blue-600 rounded-lg disabled:bg-gray-600 disabled:opacity-50 hover:bg-blue-700 transition-colors font-medium"
        >
          Next →
        </button>
        <div className="ml-8 flex gap-3 items-center">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors">−</button>
          <span className="px-4 py-2 bg-gray-700 rounded-lg font-medium min-w-[80px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors">+</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
        <canvas ref={canvasRef} className="shadow-2xl" />
      </div>
    </div>
  );
};

export default PDFViewer;
