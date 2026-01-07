/**
 * Main App Component - PixelBridge
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import './styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/favorites" element={<Home />} />
            </Routes>
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'pixel-toast',
              duration: 3000,
            }}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
