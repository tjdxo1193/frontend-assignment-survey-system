import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CompletionPage } from '@/pages/CompletionPage';
import { HomePage } from '@/pages/HomePage';
import { SurveyPage } from '@/pages/SurveyPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
