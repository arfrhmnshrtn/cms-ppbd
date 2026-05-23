import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Users from './pages/siswa_pendaftar/Users';
import ValidasiBerkas from './pages/ValidasiBerkas';
import RaporScore from './pages/rapor/RaporScore';
import InputRapor from './pages/rapor/InputRapor';

// ProtectedRoute component to handle authentication state
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('tokenAdmin');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// PublicRoute component to redirect authenticated users away from Login
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('tokenAdmin');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/:jurusan" element={<Users />} />
          <Route path="validasi-berkas" element={<ValidasiBerkas />} />
          <Route path="admins" element={<Admins />} />
          <Route path="rapor-score" element={<RaporScore />} />
          <Route path="rapor-score/input/:id" element={<InputRapor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
