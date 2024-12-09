import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateDocument from './pages/CreateDocument';
import VerifyDocument from './pages/VerifyDocument';
import SignDocument from './pages/SignDocument';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';


function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateDocument />} />
            <Route path="verify" element={<VerifyDocument />} />
            <Route path="sign" element={<SignDocument />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}