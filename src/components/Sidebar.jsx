import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Code, ChevronDown, ChevronUp, Box, User, Shield, Calendar, FileText, BookOpen, Clock } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Sidebar({ isOpen }) {
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isRaporOpen, setIsRaporOpen] = useState(false);
  const [isNilaiUjianOpen, setIsNilaiUjianOpen] = useState(false);
  const [isPengaturanJadwalOpen, setIsPengaturanJadwalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`glass sticky top-0 h-screen flex flex-col py-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-20 overflow-x-hidden ${isOpen ? 'w-[290px] px-6' : 'w-[85px] px-3'
        }`}
    >
      <div className={`flex items-center text-brand font-bold mb-8 ${isOpen ? 'gap-3 text-2xl' : 'justify-center text-xl'}`}>
        <span><img src={logo} width={40} height={60} alt="logo" /></span>
        <span className={`whitespace-nowrap text-xl font-bold ${isOpen ? 'block' : 'hidden'}`}>PORTAL SPMB</span>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            } ${!isOpen && 'justify-center'}`
          }
        >
          <LayoutDashboard size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Dashboard</span>
        </NavLink>

        <div>
          <button
            className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${!isOpen ? 'justify-center' : 'justify-between'
              }`}
            onClick={() => setIsUsersOpen(!isUsersOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Users size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Siswa Pendaftar</span>
            </div>
            {isOpen && (
              <div className="flex-shrink-0">
                {isUsersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </button>

          {isUsersOpen && (
            <div className={`flex flex-col gap-1 mt-1 overflow-hidden transition-all duration-300 ${isOpen ? 'pl-11' : 'pl-0 items-center'}`}>
              <NavLink
                to="/tkj"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jurusan TKJ</span>
              </NavLink>
              <NavLink
                to="/tkr"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jurusan TKR</span>
              </NavLink>
              <NavLink
                to="/atp"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jurusan ATP</span>
              </NavLink>
              <NavLink
                to="/ak"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jurusan Akuntansi</span>
              </NavLink>
              <NavLink
                to="/dkv"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jurusan DKV</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/validasi-berkas"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            } ${!isOpen && 'justify-center'}`
          }
        >
          <FileText size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Validasi Berkas</span>
        </NavLink>

        <div>
          <button
            className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${!isOpen ? 'justify-center' : 'justify-between'
              }`}
            onClick={() => setIsRaporOpen(!isRaporOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Calendar size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Input Rapor</span>
            </div>
            {isOpen && (
              <div className="flex-shrink-0">
                {isRaporOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </button>

          {isRaporOpen && (
            <div className={`flex flex-col gap-1 mt-1 overflow-hidden transition-all duration-300 ${isOpen ? 'pl-11' : 'pl-0 items-center'}`}>
              <NavLink
                to="/rapor-score?status=sudah"
                className={
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/rapor-score' && location.search === '?status=sudah'
                    ? 'text-brand font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Sudah di input</span>
              </NavLink>
              <NavLink
                to="/rapor-score?status=belum"
                className={
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/rapor-score' && location.search === '?status=belum'
                    ? 'text-brand font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <User size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Belum di input</span>
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button
            className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${!isOpen ? 'justify-center' : 'justify-between'
              }`}
            onClick={() => setIsNilaiUjianOpen(!isNilaiUjianOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <BookOpen size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Nilai Ujian</span>
            </div>
            {isOpen && (
              <div className="flex-shrink-0">
                {isNilaiUjianOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </button>

          {isNilaiUjianOpen && (
            <div className={`flex flex-col gap-1 mt-1 overflow-hidden transition-all duration-300 ${isOpen ? 'pl-11' : 'pl-0 items-center'}`}>
              <NavLink
                to="/nilai-ujian?status=sudah"
                className={
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/nilai-ujian' && location.search === '?status=sudah'
                    ? 'text-brand font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <FileText size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Sudah di input</span>
              </NavLink>
              <NavLink
                to="/nilai-ujian?status=belum"
                className={
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/nilai-ujian' && location.search === '?status=belum'
                    ? 'text-brand font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <FileText size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Belum di input</span>
              </NavLink>
            </div>
          )}
        </div>

        <div>
          <button
            className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${!isOpen ? 'justify-center' : 'justify-between'
              }`}
            onClick={() => setIsPengaturanJadwalOpen(!isPengaturanJadwalOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Clock size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Pengaturan Jadwal</span>
            </div>
            {isOpen && (
              <div className="flex-shrink-0">
                {isPengaturanJadwalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </button>

          {isPengaturanJadwalOpen && (
            <div className={`flex flex-col gap-1 mt-1 overflow-hidden transition-all duration-300 ${isOpen ? 'pl-11' : 'pl-0 items-center'}`}>
              <NavLink
                to="/jadwal-ujian"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <Clock size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jadwal Ujian</span>
              </NavLink>
              <NavLink
                to="/jadwal-kelulusan"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-brand font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  } ${!isOpen && 'justify-center'}`
                }
              >
                <Clock size={18} className="flex-shrink-0" />
                <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Jadwal Kelulusan</span>
              </NavLink>
            </div>
          )}
        </div>


        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            } ${!isOpen && 'justify-center'}`
          }
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Settings</span>
        </NavLink>
      </nav>

      <div className="mt-auto">
        <button
          className={`w-full flex items-center px-4 py-3 rounded-lg bg-red-500 font-medium transition-colors text-white hover:bg-red-700 hover:text-white gap-3 ${!isOpen && 'justify-center'}`}
          onClick={() => {
            localStorage.removeItem('tokenAdmin');
            navigate('/login');
          }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
