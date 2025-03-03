import React, { useState } from 'react';
import { Split, Check, AlertCircle, HelpCircle } from 'lucide-react';

export function ComparisonView() {
  const [assessmentText, setAssessmentText] = useState('');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 flex">
        {/* Assessment Draft Panel */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assessment Draft</h2>
            <textarea
              className="w-full h-[calc(100vh-12rem)] mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={assessmentText}
              onChange={(e) => setAssessmentText(e.target.value)}
              placeholder="Paste your assessment draft here..."
            />
          </div>
        </div>

        {/* Regulations Panel */}
        <div className="w-1/2 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Relevant Regulations</h2>
          <div className="space-y-4">
            <RegulationCard
              title="§336.1 - Scope and General Provisions"
              content="These rules apply to all persons who engage in the extraction, mining, storage, processing, or disposal of radioactive substances..."
              status="compliant"
            />
            <RegulationCard
              title="§336.2 - Definitions"
              content="The following words and terms, when used in this chapter, shall have the following meanings, unless the context clearly indicates otherwise..."
              status="needs-review"
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Last saved: 2 minutes ago</span>
            <span className="text-sm text-gray-600">2 sections need review</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Split className="h-4 w-4 mr-2" />
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}

function RegulationCard({ title, content, status }: { 
  title: string;
  content: string;
  status: 'compliant' | 'non-compliant' | 'needs-review';
}) {
  const statusConfig = {
    compliant: { icon: Check, className: 'text-green-600', text: 'Compliant' },
    'non-compliant': { icon: AlertCircle, className: 'text-red-600', text: 'Non-compliant' },
    'needs-review': { icon: HelpCircle, className: 'text-yellow-600', text: 'Needs Review' }
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-md font-medium text-gray-900">{title}</h3>
        <div className={`flex items-center ${statusConfig[status].className}`}>
          <StatusIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{statusConfig[status].text}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{content}</p>
    </div>
  );
}