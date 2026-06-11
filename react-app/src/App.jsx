import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import SearchPage from './pages/SearchPage.jsx';
import SchemeDetailPage from './pages/SchemeDetailPage.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        
        {/* Header Branding & Global controls */}
        <Header />
        
        {/* Main Routed Content */}
        <main className="main-content">
          <Routes>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/schemes/:slug" element={<SchemeDetailPage />} />
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </main>
        
        {/* Footer info & Ministry logos */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;
