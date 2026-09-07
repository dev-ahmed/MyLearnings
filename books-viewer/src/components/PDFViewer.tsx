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
      const loadingTask = pdfjsLib.getDocument(url);
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
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 p-4 mb-4 rounded-lg flex gap-4 items-center">
        <button
          onClick={() => setPageNum(p => Math.max(1, p - 1))}
          disabled={pageNum <= 1}
          className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
        >
          Previous
        </button>
        <span>
          Page {pageNum} of {numPages}
        </span>
        <button
          onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
          disabled={pageNum >= numPages}
          className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-600"
        >
          Next
        </button>
        <div className="ml-4 flex gap-2">
          <button onClick={() => setScale(s => s - 0.25)} className="px-3 py-2 bg-gray-700 rounded">-</button>
          <span className="px-3 py-2">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => s + 0.25)} className="px-3 py-2 bg-gray-700 rounded">+</button>
        </div>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <canvas ref={canvasRef} className="border border-gray-700" />
      </div>
    </div>
  );
};

export default PDFViewer;
