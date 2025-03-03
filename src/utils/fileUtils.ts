import mammoth from 'mammoth';
import { readPdfFile } from './pdfUtils';

export async function processFile(file: File): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (file.name.endsWith('.txt')) {
      return await file.text();
    } else if (file.name.endsWith('.pdf')) {
      return await readPdfFile(file);
    } else {
      throw new Error(`Unsupported file type: ${file.name.split('.').pop()}. Please upload a PDF, DOCX, or TXT file.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while processing the file.');
  }
}