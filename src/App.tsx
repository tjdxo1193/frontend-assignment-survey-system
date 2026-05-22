import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { SurveyPage } from '@/pages/SurveyPage';
import { CompletionPage } from '@/pages/CompletionPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/complete" element={<CompletionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
