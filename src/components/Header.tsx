import React from 'react';
import { Radiation } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <Radiation className="h-8 w-8 text-green-500" />
            <span className="ml-2 text-xl font-semibold">RegAI-Compliance</span>
          </Link>
          <nav className="flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/upload" className="text-gray-600 hover:text-gray-900">Upload</Link>
            <Link to="/regulations" className="text-gray-600 hover:text-gray-900">Regulations</Link>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Get Started
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}