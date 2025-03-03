import React, { useState, useEffect } from 'react';
import { Upload, Save, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { processFile } from '../utils/fileUtils';

export function RegulationsManager() {
  const [file, setFile] = useState<File | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing regulations on component mount
  useEffect(() => {
    const storedRegulations = localStorage.getItem('regulations');
    if (storedRegulations) {
      setCurrentContent(storedRegulations);
    }
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      try {
        const content = await processFile(acceptedFiles[0]);
        setCurrentContent(content);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Failed to process file');
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Store in localStorage
      localStorage.setItem('regulations', currentContent);
      localStorage.setItem('regulationsUpdated', new Date().toISOString());

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating regulations:', error);
      setError('Failed to update regulations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Regulations Manager</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Save className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Regulations updated successfully! These regulations will now be used in document analysis.</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload New Regulations</h2>
            <p className="text-gray-600 mb-4">
              Upload your regulatory documents here. These regulations will be used as a reference
              when analyzing documents for compliance.
            </p>
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-green-500"
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drag and drop regulations file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOCX, TXT
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Current Regulations Content</h2>
            <div className="border rounded-lg p-4">
              <textarea
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                className="w-full h-96 font-mono text-sm"
                placeholder="Regulations content will appear here. You can also paste regulations directly."
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading || !currentContent}
            className={`w-full py-3 rounded-lg text-white font-medium transition-colors
              ${loading || !currentContent 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Updating...' : 'Update Regulations'}
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-md font-semibold text-blue-800 mb-2">How This Works</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-2">
              <li>Upload or paste your regulatory requirements</li>
              <li>The system will store these regulations locally</li>
              <li>When analyzing documents, the AI will compare them against these regulations</li>
              <li>The analysis will highlight compliance and any potential issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}