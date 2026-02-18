import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';

const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const NoteEditor = React.lazy(() => import('./pages/NoteEditor'));
const PrivateNotes = React.lazy(() => import('./pages/PrivateNotes'));
const ThoughtCloud = React.lazy(() => import('./pages/ThoughtCloud'));

// Fallbacks
const LoadingFallback = () => <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">Loading...</div>;

import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RootLayout />}>
                  <Route index element={<Landing />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard type="all" />} />
                  <Route path="new" element={<NoteEditor />} />
                  <Route path="note/:noteId" element={<NoteEditor />} />
                  <Route path="favorites" element={<Dashboard type="favorites" />} />
                  <Route path="archive" element={<Dashboard type="archive" />} />
                  <Route path="trash" element={<Dashboard type="trash" />} />
                  <Route path="thought-cloud" element={<ThoughtCloud />} />
                  <Route path="private-notes" element={<PrivateNotes />} /> {/* Added PrivateNotes route */}
                </Route>
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
