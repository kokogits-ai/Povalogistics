import { useState, useEffect } from "react";
import { Shipment } from "../types";
import { 
  Package, Plus, Search, Filter, LogOut,
  Trash2, Edit, CheckCircle, AlertTriangle, Truck, User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchShipments();
    };
    init();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/check");
      if (!res.ok) navigate("/admin/login");
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipments");
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      try {
        const res = await fetch(`/api/admin/shipments/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchShipments();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.receiver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-8">
           <div className="flex items-center gap-2 mb-12">
             <div className="w-8 h-8 bg-[#FF6321] rounded flex items-center justify-center text-white font-black italic">P</div>
             <span className="text-xl font-bold tracking-tight">POVA <span className="text-[#FF6321]">ADMIN</span></span>
           </div>
           
           <nav className="space-y-4">
             <a href="/admin" className="flex items-center gap-3 bg-[#FF6321] text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20">
                <Package size={18} />
                Shipments
             </a>
             <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                <Truck size={18} />
                Transit Logs
             </a>
             <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white p-4 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
                <User size={18} />
                Client DB
             </a>
           </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-black uppercase tracking-widest text-xs"
           >
             <LogOut size={18} />
             Terminal Exit
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-8 sticky top-0 z-10">
           <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">Manifest Management</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Global Logistics Operations Controller</p>
              </div>
              
              <button 
                onClick={() => navigate("/admin/shipment/new")}
                className="bg-[#FF6321] hover:opacity-90 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-xl shadow-orange-500/10 active:scale-95"
              >
                <Plus size={18} />
                Create New Manifest
              </button>
           </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
           {/* Filters */}
           <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="SEARCH MANIFESTS, RECEIVERS OR TRACKING IDS..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-14 pr-4 py-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black uppercase tracking-widest text-xs placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="bg-white border border-slate-200 rounded-xl px-8 py-4 flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors font-black uppercase tracking-widest text-xs">
                <Filter size={16} />
                Filters
              </button>
           </div>

           {/* Shipment List */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-[0.2em] text-[10px] font-black border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Manifest ID</th>
                    <th className="px-8 py-5">Receiver</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Origin/Dest</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 uppercase font-black tracking-widest text-xs">Accessing Database...</td>
                    </tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 uppercase font-black tracking-widest text-xs">No active manifests found.</td>
                    </tr>
                  ) : (
                    filteredShipments.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-900 group-hover:text-[#FF6321] transition-colors uppercase tracking-tight">{s.trackingNumber}</div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{s.package.title}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-800 uppercase text-xs">{s.receiver.name}</div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{s.receiver.city}, {s.receiver.country}</div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit border",
                             s.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                             s.status === 'On Hold' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                             'bg-slate-100 text-slate-700 border-slate-200'
                           )}>
                             {s.status === 'Delivered' && <CheckCircle size={10} />}
                             {s.status === 'On Hold' && <AlertTriangle size={10} />}
                             {s.status}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {s.origin.city} &rarr; {s.destination.city}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                           <button 
                             onClick={() => navigate(`/admin/shipment/${s.id}`)}
                             className="p-2.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-all"
                           >
                              <Edit size={18} />
                           </button>
                           <button 
                             onClick={() => s.id && handleDelete(s.id)}
                             className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                           >
                              <Trash2 size={18} />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
