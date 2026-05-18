import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, ShieldCheck, Mail, Key, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Server-side login (for cookies/session)
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        // 2. Client-side Firebase Auth login (for Firestore/Storage rules)
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (authErr: any) {
          // If user doesn't exist in Firebase yet, try to create them (First time setup)
          if (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential") {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
            } catch (createErr: any) {
              console.error("Firebase Auth creation failed:", createErr);
              // We might still navigate if server auth succeeded, but Firestore will fail.
              // So we show an error.
              setError("Firebase Auth synchronization failed. Contact system admin.");
              setLoading(false);
              return;
            }
          } else {
            throw authErr;
          }
        }
        
        navigate("/admin");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      setError("Network or Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10">
        <div className="bg-[#FF6321] p-10 text-center text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-xl">
            <Lock size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">Terminal Access</h1>
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Pova Logistics Authority Matrix</p>
        </div>
        
        <div className="p-10 space-y-8">
          {error && (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                 <Label>Authority Email</Label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="email" 
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
                     placeholder="admin@pova.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
              </div>
              <div className="relative">
                 <Label>Security Token (Password)</Label>
                 <div className="relative">
                   <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="password" 
                     required
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-sm"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-slate-800 text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Authorize Entry
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <ShieldCheck className="text-[#FF6321]" size={24} />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
              This terminal is monitored. Unauthorized access attempts are logged and reported to global security.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
           <a href="/" className="text-[10px] font-black text-slate-400 hover:text-[#FF6321] uppercase tracking-[0.2em] transition-colors">
             &larr; Return to Public Portal
           </a>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
      {children}
    </label>
  );
}
