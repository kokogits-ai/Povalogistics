import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert, Package, Globe, Truck } from "lucide-react";
import { motion } from "motion/react";

export default function HomePage() {
  const [trackingId, setTrackingId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-[#0F172A] flex items-center justify-between px-8 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6321] rounded flex items-center justify-center text-white font-black italic">P</div>
          <span className="text-white font-bold tracking-tight text-xl uppercase">POVA LOGISTICS</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-6">
            <span className="text-slate-400 text-sm font-medium hover:text-white cursor-pointer transition-colors">Tracking</span>
            <span className="text-slate-400 text-sm font-medium hover:text-white cursor-pointer transition-colors">Services</span>
            <span className="text-slate-400 text-sm font-medium hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
          <button 
            onClick={() => navigate("/admin/login")}
            className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded font-medium transition-colors border border-white/5"
          >
            Admin Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-100 border-b border-slate-200">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,#0F172A_0%,transparent_70%)]"></div>
          
          <div className="max-w-7xl mx-auto px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#FF6321] text-[10px] font-black uppercase tracking-widest mb-6">
                  <ShieldAlert size={12} /> Real-time Security
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6 text-[#0F172A]">
                  GLOBAL <br />
                  <span className="text-[#FF6321]">LOGISTICS</span> <br />
                  REDEFINED.
                </h1>
                <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
                  Experience precision tracking and secure handling for your most critical assets. Spanning 150+ countries with advanced logistical protocols.
                </p>

                {/* Tracking Input */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200 p-2 focus-within:ring-4 focus-within:ring-[#FF6321]/10 transition-all">
                    <div className="flex-1 flex items-center px-4 gap-3">
                      <Search size={22} className="text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="Enter tracking number (e.g. PV-9284-7710)" 
                        className="w-full py-4 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-300 font-bold tracking-tight"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="bg-[#0F172A] hover:bg-slate-800 text-white px-10 py-4 rounded-lg font-bold transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider"
                    >
                      Track Now
                    </button>
                  </div>
                </form>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block"
              >
                <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                      <Globe size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Network</p>
                      <p className="text-lg font-bold text-slate-800">150+ Hub Facilities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#FF6321] rounded-xl flex items-center justify-center text-white">
                      <ShieldAlert size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Delivery</p>
                      <p className="text-lg font-bold text-slate-800">99.9% Success Rate</p>
                    </div>
                  </div>
                  <div className="h-32 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                    <Truck className="text-slate-200" size={64} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Brand Bar */}
        <section className="py-12 bg-white border-b border-slate-100 overflow-hidden">
           <div className="max-w-7xl mx-auto px-8 flex justify-between items-center opacity-30 grayscale saturate-0 space-x-12">
              <span className="text-2xl font-black tracking-tighter">BELIZ CAPITAL</span>
              <span className="text-2xl font-black tracking-tighter">NY CORPORATE</span>
              <span className="text-2xl font-black tracking-tighter">EURO SHIPPING</span>
              <span className="text-2xl font-black tracking-tighter">HUB LOGISTICS</span>
              <span className="text-2xl font-black tracking-tighter">PRIORITY DEL</span>
           </div>
        </section>
      </main>

      {/* Footer Bar */}
      <footer className="h-16 bg-white border-t border-slate-200 px-8 flex flex-col md:flex-row items-center justify-between shrink-0 mt-20">
        <div className="text-[10px] text-slate-400 font-medium">
          &copy; 2026 POVA LOGISTICS LTD. ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Security Policy</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Global Network</span>
        </div>
      </footer>
    </div>

  );
}
