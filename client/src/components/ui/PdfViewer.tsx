
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const loadPdf = async () => {
      const pdfDoc = await pdfjsLib.getDocument(url).promise;
      setPdf(pdfDoc);
    };
    loadPdf();
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !containerRef.current) return;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(canvas);
    };

    renderPage();
  }, [pdf, pageNumber]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const pageHeight = target.scrollHeight / (pdf?.numPages || 1);
    const newPage = Math.floor(scrollTop / pageHeight) + 1;
    setPageNumber(newPage);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] overflow-auto"
      onScroll={handleScroll}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

export default PdfViewer;