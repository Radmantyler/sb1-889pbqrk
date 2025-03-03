import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ReportAnalysis } from './pages/ReportAnalysis';
import { RegulationsManager } from './pages/RegulationsManager';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analysis" element={<ReportAnalysis />} />
          <Route path="/regulations" element={<RegulationsManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;