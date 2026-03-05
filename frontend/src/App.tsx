import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { MapPage } from './pages/MapPage';
import { SavedPage } from './pages/SavedPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { ItineraryPage } from './pages/ItineraryPage';
import { ReviewPage } from './pages/ReviewPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected pages */}
          <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
          <Route path="/explore" element={<ProtectedLayout><ExplorePage /></ProtectedLayout>} />
          <Route path="/map" element={<ProtectedLayout><MapPage /></ProtectedLayout>} />
          <Route path="/saved" element={<ProtectedLayout><SavedPage /></ProtectedLayout>} />
          <Route path="/create" element={<ProtectedLayout><CreatePostPage /></ProtectedLayout>} />
          <Route path="/profile/:username" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          <Route path="/itinerary/:id" element={<ProtectedLayout><ItineraryPage /></ProtectedLayout>} />
          <Route path="/review/:id" element={<ProtectedLayout><ReviewPage /></ProtectedLayout>} />
          <Route path="/messages" element={<ProtectedLayout><MessagesPage /></ProtectedLayout>} />
          <Route path="/messages/:convId" element={<ProtectedLayout><ChatPage /></ProtectedLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
