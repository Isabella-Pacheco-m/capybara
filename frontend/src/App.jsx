import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Companies from './pages/admin/Companies';
import Events from './pages/admin/Events';
import Profiles from './pages/admin/Profiles';
import EventRegister from './pages/public/EventRegister';
import EventDirectory from './pages/public/EventDirectory';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/:eventCode" element={<EventRegister />} />
          <Route path="/events/:eventCode/directory" element={<EventDirectory />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/companies"
            element={
              <PrivateRoute>
                <Companies />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/profiles"
            element={
              <PrivateRoute>
                <Profiles />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;