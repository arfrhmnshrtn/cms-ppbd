import { Search, Bell, Menu } from 'lucide-react';

export default function Header({ isOpen, setIsOpen }) {

  // const name = localStorage.getItem('name');
  const name = 'admin';
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="h-[70px] flex items-center justify-between px-8 sticky top-0 z-10 glass">
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Bell size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
          {initial}
        </div>
      </div>
    </header>
  );
}
