import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Set worker source path
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${getDocument.version}/pdf.worker.min.js`;

export async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error('Failed to read PDF file. Please ensure the file is not corrupted or try a different format (DOCX/TXT).');
  }
}

export async function generatePdf(contentElement: HTMLElement, filename: string): Promise<void> {
  try {
    // Use html2canvas to capture the rendered content with proper styling
    const canvas = await html2canvas(contentElement, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      windowWidth: contentElement.scrollWidth,
      windowHeight: contentElement.scrollHeight,
      onclone: (document) => {
        // Ensure proper font loading in the cloned document
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'Times New Roman';
            src: url('https://fonts.cdnfonts.com/css/times-new-roman') format('woff2');
          }
          .report-content {
            font-family: 'Times New Roman', Times, serif;
          }
        `;
        document.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling']
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const imgX = (pageWidth - imgWidth * ratio) / 2;

    // Calculate how many pages we need
    const pagesNeeded = Math.ceil(imgHeight * ratio / pageHeight);

    for (let i = 0; i < pagesNeeded; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      // For each page, add the image with proper offset
      pdf.addImage(
        imgData,
        'JPEG',
        imgX,
        -(i * pageHeight),
        imgWidth * ratio,
        imgHeight * ratio,
        undefined,
        'FAST'
      );
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}