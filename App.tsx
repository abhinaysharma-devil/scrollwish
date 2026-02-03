import React, { useState, useEffect } from 'react';
// import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Editor } from './pages/Editor';
import { SharePage } from './pages/SharePage';
import { MyCards } from './pages/MyCards';
import { Legal } from './pages/Legal';
import { LoginModal } from './components/LoginModal';
import { User } from './types';

// Wrapper to conditionally render Header/Footer
const Layout: React.FC<{ 
    children: React.ReactNode; 
    onLogin: () => void; 
    onLogout: () => void;
    user: User | null 
}> = ({ children, onLogin, onLogout, user }) => {
  const location = useLocation();
  // Don't show header/footer on Share page or Editor (editor has its own)
  const isImmersive = location.pathname.includes('/card/') || location.pathname.includes('/editor');

  return (
    <>
      {!isImmersive && <Header onLoginClick={onLogin} onLogoutClick={onLogout} user={user} />}
      <main className="flex-grow">
        {children}
      </main>
      {!isImmersive && <Footer />}
    </>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Restore session on mount
  useEffect(() => {
      const savedUser = localStorage.getItem('scrollwish_user');
      if (savedUser) {
          try {
              const parsed = JSON.parse(savedUser);
              if (parsed && parsed.id) {
                  setUser(parsed);
              }
          } catch (e) {
              console.error("Failed to restore session", e);
              localStorage.removeItem('scrollwish_user');
          }
      }
  }, []);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('scrollwish_user', JSON.stringify(u));
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('scrollwish_user');
  };

  return (
    <Router>
      <Layout onLogin={() => setIsLoginOpen(true)} onLogout={handleLogout} user={user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/editor/:templateId" element={<Editor user={user} onLoginReq={() => setIsLoginOpen(true)} />} />
          <Route path="/card/:hash" element={<SharePage user={user} onLoginReq={() => setIsLoginOpen(true)} />} />
          <Route path="/my-cards" element={<MyCards user={user} />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/contact" element={<Legal />} />
        </Routes>
      </Layout>
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </Router>
  );
}