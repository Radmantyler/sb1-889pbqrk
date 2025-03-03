import React from 'react';
import { FileText, Shield, Database } from 'lucide-react';

export function Features() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Compliance Solutions</h2>
        <p className="text-gray-600 text-center mb-16">
          Powered by advanced AI technology and regulatory expertise
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={FileText}
            title="Automated Report Generation"
            description="AI-driven analysis and generation of radiological assessment reports compliant with federal and state regulations."
          />
          <FeatureCard
            icon={Shield}
            title="Regulatory Compliance"
            description="Built-in compliance with Texas Administrative Code Chapter 336 and state-specific radiological regulations."
          />
          <FeatureCard
            icon={Database}
            title="Data Analysis"
            description="Advanced processing of radiological data with machine learning algorithms for accurate assessments."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}