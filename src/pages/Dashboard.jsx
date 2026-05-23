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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <div className="p-4 rounded-lg bg-slate-50 text-brand flex justify-center items-center">
              {stat.icon}
            </div>
            <div>
              <h3 className="text-sm text-slate-500 font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <small className="text-green-500 font-semibold">{stat.trend}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-6 rounded-xl min-h-[300px]">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Revenue Overview</h2>
        <div className="h-[200px] flex items-center justify-center text-slate-500 rounded border border-dashed border-slate-300">
          <p>[ Chart Placeholder ]</p>
        </div>
      </div>
    </>
  );
}
