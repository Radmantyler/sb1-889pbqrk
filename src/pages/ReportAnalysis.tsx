import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Copy, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generatePdf } from '../utils/pdfUtils';

export function ReportAnalysis() {
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem('documentAnalysis');
    if (storedAnalysis) {
      setAnalysis(storedAnalysis);
    }
  }, []);

  const handleCopy = async () => {
    const content = document.querySelector('.report-content')?.textContent;
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (analysis && reportContentRef.current) {
      try {
        await generatePdf(
          reportContentRef.current,
          'radiological-assessment-report.pdf'
        );
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  const handleShare = async () => {
    if (!analysis || !reportContentRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        generatePdf(reportContentRef.current!, 'report.pdf')
          .then(() => {
            resolve(new Blob([analysis], { type: 'application/pdf' }));
          });
      });

      if (navigator.share) {
        await navigator.share({
          title: 'Radiological Assessment Report',
          files: [new File([blob], 'radiological-assessment-report.pdf', { type: 'application/pdf' })]
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!analysis) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Available</h1>
          <p className="text-gray-600 mb-6">Please upload documents to generate an analysis.</p>
          <Link 
            to="/upload" 
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Upload Page
          </Link>
        </div>
      </div>
    );
  }

  // Parse the analysis content into sections
  const renderSections = () => {
    const lines = analysis.split('\n');
    const sections: JSX.Element[] = [];
    let currentSection = '';
    let sectionType: 'title' | 'subtitle' | 'info' | 'header' | 'content' = 'content';

    lines.forEach((line, index) => {
      // Handle title
      if (line.includes('REGULATORY COMPLIANCE REPORT')) {
        if (currentSection) {
          sections.push(renderSection(currentSection, sectionType, sections.length));
        }
        currentSection = line;
        sectionType = 'title';
      }
      // Handle subtitle (contains "vs.")
      else if (line.includes(' vs. ')) {
        if (currentSection) {
          sections.push(renderSection(currentSection, sectionType, sections.length));
        }
        currentSection = line;
        sectionType = 'subtitle';
      }
      // Handle document info
      else if (line.match(/^(Prepared for:|Prepared by:|Date:)/)) {
        if (!currentSection.includes('Prepared')) {
          if (currentSection) {
            sections.push(renderSection(currentSection, sectionType, sections.length));
          }
          currentSection = line;
          sectionType = 'info';
        } else {
          currentSection += '\n' + line;
        }
      }
      // Handle section headers (numbered sections)
      else if (line.match(/^\d+\./)) {
        if (currentSection) {
          sections.push(renderSection(currentSection, sectionType, sections.length));
        }
        currentSection = line;
        sectionType = 'header';
      }
      // Handle content
      else if (line.trim()) {
        if (sectionType === 'header') {
          sections.push(renderSection(currentSection, sectionType, sections.length));
          currentSection = line;
          sectionType = 'content';
        } else {
          currentSection += (currentSection ? '\n' : '') + line;
        }
      }
      
      // Push the last section
      if (index === lines.length - 1 && currentSection) {
        sections.push(renderSection(currentSection, sectionType, sections.length));
      }
    });

    return sections;
  };

  const renderSection = (content: string, type: string, key: number) => {
    switch (type) {
      case 'title':
        return (
          <section key={key} className="mb-8">
            <h1 className="report-title mb-4">{content}</h1>
          </section>
        );
      case 'subtitle':
        return (
          <section key={key} className="mb-8">
            <h2 className="report-subtitle mb-4">{content}</h2>
          </section>
        );
      case 'info':
        return (
          <section key={key} className="report-body mb-4">
            {content.split('\n').map((line, i) => {
              const [label, value] = line.split(':').map(part => part.trim());
              return (
                <p key={i} className="mb-1">
                  <strong>{label}:</strong> {value}
                </p>
              );
            })}
          </section>
        );
      case 'header':
        return (
          <section key={key} className="mb-8">
            <h3 className="report-section-header mb-4">{content}</h3>
          </section>
        );
      default:
        return (
          <section key={key} className="mb-6">
            <p className="report-body leading-relaxed whitespace-pre-line">{content}</p>
          </section>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/upload" 
          className="flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Start New Assessment
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDownload}
            className="flex items-center text-gray-600 hover:text-gray-900"
            title="Download Report"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center text-gray-600 hover:text-gray-900"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center text-gray-600 hover:text-gray-900"
            title="Share Report"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div ref={reportContentRef} className="p-8 report-content">
          <div className="max-w-none">
            {renderSections()}
          </div>
        </div>
      </div>
    </div>
  );
}