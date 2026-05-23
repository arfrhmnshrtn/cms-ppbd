export default function Settings() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="glass p-6 rounded-xl max-w-2xl">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Profile Settings</h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div>
            <label className="block mb-2 text-slate-900 font-medium text-sm">Full Name</label>
            <input type="text" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all" defaultValue="Admin User" />
          </div>
          
          <div>
            <label className="block mb-2 text-slate-900 font-medium text-sm">Email Address</label>
            <input type="email" className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all" defaultValue="admin@jelajah.in" />
          </div>

          <div>
            <label className="block mb-2 text-slate-900 font-medium text-sm">Theme Preference</label>
            <select className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all">
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto">Save Changes</button>
          </div>
        </form>
      </div>
    </>
  );
}
