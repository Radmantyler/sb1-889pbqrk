import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { analyzeDocuments } from '../services/openai';
import { processFile } from '../utils/fileUtils';

interface FileWithPreview extends File {
  preview?: string;
}

export function UploadPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [documentFile, setDocumentFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle successful payment redirect
  useEffect(() => {
    if (sessionId) {
      window.history.replaceState({}, '', '/upload');
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Payment successful! You can now upload your document.';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 5000);
    }
  }, [sessionId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setDocumentFile(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!documentFile) {
      setError('Please upload a document file before proceeding.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Process document file
      const documentText = await processFile(documentFile);

      if (!documentText?.trim()) {
        throw new Error('Document appears to be empty. Please check the file contents.');
      }

      const analysisResult = await analyzeDocuments(documentText, documentFile.name);
      setAnalysis(analysisResult);

      // Store the analysis in sessionStorage before navigating
      sessionStorage.setItem('documentAnalysis', analysisResult);
      navigate('/analysis');

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'OpenAI API key is not properly configured. Please contact support.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Service is temporarily busy. Please try again in a few moments.';
        } else if (error.message.includes('file')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    setDocumentFile(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload Document for Analysis</h1>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* Document Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
            <p className="text-gray-600 mb-4">
              Upload your document for AI analysis and regulatory compliance assessment.
            </p>

            {!documentFile ? (
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-green-500"
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">Drag and drop your document here, or</p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Browse Files
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: .docx, .txt, .pdf
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-900">{documentFile.name}</span>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!documentFile || isAnalyzing}
            className={`w-full mt-6 px-4 py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center
              ${(!documentFile || isAnalyzing) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              'Analyze Document'
            )}
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Accepted File Types:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Microsoft Word Documents (.docx)</li>
            <li>• Text Files (.txt)</li>
            <li>• PDF Files (.pdf)</li>
          </ul>
        </div>
      </div>

      {analysis && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Analysis Preview</h2>
          <div className="whitespace-pre-wrap text-gray-700 max-h-96 overflow-y-auto">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}