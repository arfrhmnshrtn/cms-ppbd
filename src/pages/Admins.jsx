import { MoreVertical, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Admins() {
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAdmins(data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Manage Admins</h1>
      </div>

      <div className="glass p-6 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse cursor-default">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-500 text-sm uppercase tracking-wider">Name</th>
                <th className="p-4 font-semibold text-slate-500 text-sm uppercase tracking-wider">Email</th>
                <th className="p-4 font-semibold text-slate-500 text-sm uppercase tracking-wider">Role</th>
                {/* <th className="p-4 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-brand flex items-center gap-2">
                    <ShieldAlert size={16} />
                    {admin.name}
                  </td>
                  <td className="p-4 text-slate-600">{admin.email}</td>
                  <td className="p-4 text-slate-600">{admin.role}</td>
                  {/* <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 cursor-pointer text-blue-500 rounded-full hover:text-brand hover:bg-brand/10 transition-colors inline-flex">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 cursor-pointer text-red-500 rounded-full hover:text-red-500 hover:bg-red-50 transition-colors inline-flex">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
