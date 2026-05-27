import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Users', value: '10,482', icon: <Users size={24} />, trend: '+12%' },
    { title: 'Total Revenue', value: '$45,231.89', icon: <DollarSign size={24} />, trend: '+8%' },
    { title: 'Active Sessions', value: '1,204', icon: <Activity size={24} />, trend: '+2%' },
    { title: 'Conversion Rate', value: '3.4%', icon: <TrendingUp size={24} />, trend: '+0.5%' },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 italic">Selamat Datang di Sistem Informasi PPDB SMKN 1 Simpang Pematang</p>
      </div>
    </>
  );
}
