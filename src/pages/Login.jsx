import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, GraduationCap, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import logo from '../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('adminsmk1sp');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // const apiUrl = 'https://a51e-182-3-103-83.ngrok-free.app/api';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Asumsi struktur response JWT berupa { data: { token: '...' } } atau { token: '...' }
        const token = data.data.token;
        if (token) {
          localStorage.setItem('tokenAdmin', token);
          localStorage.setItem('name', 'admin');
          await Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Login berhasil! Mengalihkan ke halaman dashboard...',
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/');
        } else {
          setError('Token tidak ditemukan pada response server.');
        }
      } else {
        setError(data.message || 'Login gagal. Periksa kembali username dan password!');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan pada server atau koneksi terputus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
            <img src={logo} alt="logo" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">PORTAL ADMIN PPDB</h1>
          <p className="text-slate-500 mt-2 text-center text-sm">SMKN 1 Simpang Pematang</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-slate-900 font-medium text-sm">Username</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              placeholder="adminsmk1sp"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-slate-900 font-medium text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full p-3 pr-11 border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-white py-3 font-semibold transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Authenticating...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
