import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shipment, TrackingUpdate } from "../types";
import { 
  Truck, User, MapPin, Package, Calendar, Activity, 
  Info, ShieldCheck, Phone, Mail, Printer,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import MapDisplay from "../components/Map";

export default function TrackingPage() {
  const { trackingId } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!trackingId) return;
      try {
        const res = await fetch(`/api/shipments/${trackingId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("No shipment found with this tracking number.");
          } else {
            setError("An error occurred while fetching tracking info.");
          }
          return;
        }

        const data = await res.json();
        setShipment(data);
        setUpdates(data.updates || []);
      } catch (err: any) {
        console.error(err);
        setError("An error occurred while fetching tracking info.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [trackingId]);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return format(d, "MMM dd, yyyy");
  };

  const formatTime = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return format(d, "HH:mm");
  };

  if (loading) return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 justify-center items-center">
       <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FF6321] rounded-full animate-spin"></div>
    </div>
  );

  if (error || !shipment) return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-slate-200 shadow-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2">Tracking Not Found</h1>
        <p className="text-slate-500 mb-8 font-medium">PV-ID: {trackingId}</p>
        <button onClick={() => navigate("/")} className="w-full bg-[#0F172A] text-white py-3 rounded-lg font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">
          Return to Portal
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-[#0F172A] flex items-center justify-between px-8 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-[#FF6321] rounded flex items-center justify-center text-white font-black italic text-lg shadow-lg">P</div>
          <span className="text-white font-bold tracking-tight text-xl">POVA LOGISTICS</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            <span className="text-slate-400 text-sm font-medium hover:text-white cursor-pointer px-2 transition-colors">Tracking</span>
            <span className="text-slate-400 text-sm font-medium hover:text-white cursor-pointer px-2 transition-colors">Support</span>
          </div>
        </div>
      </nav>

      {/* Paused Tracking Notice */}
      {shipment.isPaused && (
        <div className="bg-orange-500 text-white px-8 py-3 flex items-center gap-3 shrink-0">
          <AlertTriangle size={20} className="animate-pulse" />
          <p className="text-sm font-black uppercase tracking-widest">
            Protocol Halt: {shipment.holdReason || "This shipment is currently on hold. Contact support for more info."}
          </p>
        </div>
      )}

      {/* Sub-Header / Tracking Summary */}
      <header className="bg-white border-b border-slate-200 px-8 py-8 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">PV-{shipment.trackingNumber.slice(-8)}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              shipment.status === 'Delivered' ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-[#FF6321] border-orange-200"
            )}>
              {shipment.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">
            Status: <span className="text-slate-900 font-black">{shipment.status}</span> &bull; 
            Priority: <span className="text-[#FF6321] font-black uppercase italic ml-1">{shipment.package.priority}</span> &bull; 
            Est. Delivery: <span className="text-slate-900 font-black ml-1">{shipment.estimatedDelivery}</span>
          </p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="px-6 py-3 text-xs bg-slate-100 font-black text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-200 transition-all uppercase tracking-widest">Share Update</button>
          <button className="px-6 py-3 text-xs bg-[#0F172A] font-black text-white rounded-lg hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all uppercase tracking-widest">Print Waybill</button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left & Middle Columns */}
        <section className="col-span-12 lg:col-span-8 space-y-8 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Route Visualization */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100%] opacity-50 transition-all group-hover:scale-110"></div>
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Origin</p>
                <p className="text-lg font-black text-slate-800">{shipment.origin.city}</p>
                <p className="text-xs text-slate-400 font-mono font-bold uppercase">{shipment.origin.country}</p>
              </div>
              <div className="flex-1 mx-8 relative flex items-center px-4">
                <div className="h-[2px] w-full bg-slate-100 rounded"></div>
                <div className="absolute left-0 w-3 h-3 bg-slate-900 rounded-full border-2 border-white shadow-sm ring-4 ring-slate-50"></div>
                <div className="absolute left-[65%] w-6 h-6 bg-[#FF6321] rounded-full border-4 border-orange-100 shadow-xl z-10 ring-4 ring-orange-50 animate-pulse"></div>
                <div className="absolute right-0 w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Destination</p>
                <p className="text-lg font-black text-slate-800">{shipment.destination.city}</p>
                <p className="text-xs text-slate-400 font-mono font-bold uppercase">{shipment.destination.country}</p>
              </div>
            </div>
            <div className="flex justify-center relative z-10">
               <p className="text-[10px] font-black py-1.5 px-4 bg-slate-900 rounded-full text-white uppercase tracking-widest shadow-lg">
                 Current: {shipment.current.city}, {shipment.current.country}
               </p>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[450px]">
            <MapDisplay 
              origin={{ ...shipment.origin, lat: shipment.origin.lat || 0, lng: shipment.origin.lng || 0 } as any} 
              current={{ ...shipment.current, lat: shipment.current.lat || 0, lng: shipment.current.lng || 0 } as any} 
              destination={{ ...shipment.destination, lat: shipment.destination.lat || 0, lng: shipment.destination.lng || 0 } as any} 
            />
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sender Details */}
            <div className="bg-white p-6 rounded-2xl border-l-[6px] border-l-slate-300 border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                <User size={12} className="text-[#FF6321]" /> Sender Details
              </h3>
              <p className="font-black text-slate-900 text-lg">{shipment.sender.name}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold">
                {shipment.sender.address && <>{shipment.sender.address}<br /></>}
                {shipment.sender.city}, {shipment.sender.country}
              </p>
              <div className="mt-4 flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Phone size={10} /> {shipment.sender.phone}</span>
              </div>
            </div>
            {/* Receiver Details */}
            <div className="bg-white p-6 rounded-2xl border-l-[6px] border-l-[#FF6321] border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-black mb-4 flex items-center gap-2">
                <User size={12} className="text-[#FF6321]" /> Receiver Details
              </h3>
              <p className="font-black text-slate-900 text-lg">{shipment.receiver.name}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-bold">
                {shipment.receiver.address}<br />
                {shipment.receiver.city}, {shipment.receiver.country}
              </p>
              <div className="mt-4 flex gap-4 text-[10px] font-black text-[#FF6321] uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Mail size={10} /> {shipment.receiver.email}</span>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-black mb-6 flex items-center gap-2">
               <Package size={14} className="text-slate-800" /> Package Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Weight</p>
                <p className="text-lg font-black text-slate-900">{shipment.package.weight} KG</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Quantity</p>
                <p className="text-lg font-black text-slate-900">{shipment.package.quantity} Units</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Category</p>
                <p className="text-lg font-black text-slate-900 uppercase">{shipment.package.category || 'General'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Fragile</p>
                <span className={cn(
                  "text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest",
                  shipment.package.fragile ? "Priority High" : "Standard"
                )}>
                  {shipment.package.fragile ? "Priority High" : "Standard"}
                </span>
              </div>
            </div>
            
            {/* Shipment Images */}
            {shipment.images && shipment.images.length > 0 && (
              <div className="mt-10 pt-10 border-t border-slate-100">
                 <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4">Package Identity Tokens</p>
                 <div className="flex flex-wrap gap-4">
                    {shipment.images.map((img: string, i: number) => (
                      <div key={i} className="w-32 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group">
                         <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Timeline */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="bg-[#0F172A] text-white rounded-2xl shadow-2xl flex flex-col h-full border border-white/5 relative">
            <div className="p-8 border-b border-white/10 shrink-0">
              <h2 className="font-black tracking-tight text-xl mb-1 uppercase">Logistics Timeline</h2>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Last Relay: {shipment.updatedAt ? formatTime(shipment.updatedAt) : "SYNCING"}
              </p>
            </div>
            <div className="flex-1 p-8 space-y-10 overflow-y-auto relative custom-scrollbar-white">
              {updates.length === 0 ? (
                <div className="text-center py-20 text-white/20 uppercase font-black text-xs tracking-widest">Awaiting Relay Data</div>
              ) : (
                updates.map((update, idx) => (
                  <div key={update.id} className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-4 h-4 rounded-full z-10 ring-8",
                        idx === 0 ? "bg-[#FF6321] ring-orange-500/10 shadow-[0_0_20px_#FF6321]" : "bg-white/20 ring-transparent"
                      )}></div>
                      {idx !== updates.length - 1 && (
                        <div className="w-[2px] h-24 bg-white/10 absolute top-4 left-2 -ml-[1px]"></div>
                      )}
                    </div>
                    <div className="-mt-1.5 flex-1">
                      <p className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        idx === 0 ? "text-white" : "text-white/80"
                      )}>
                        {update.status}
                      </p>
                      <p className="text-[11px] text-[#FF6321] font-black uppercase tracking-wider mb-2">
                        {update.location} &bull; {formatDate(update.timestamp)}
                        <span className="text-white/30 ml-2">{formatTime(update.timestamp)}</span>
                      </p>
                      <p className="text-xs text-white/40 leading-relaxed font-medium">
                        {update.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-white/5 text-center shrink-0 border-t border-white/10">
               <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.2em]">Pova Systems Terminal v4.2.1</p>
            </div>
          </div>
        </aside>

      </main>

      {/* Footer Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          &copy; 2026 POVA LOGISTICS LTD &bull; PV-SYS-TERMINAL
        </div>
        <div className="hidden md:flex gap-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] px-4">
          <span className="hover:text-[#FF6321] cursor-pointer">Security</span>
          <span className="hover:text-[#FF6321] cursor-pointer">Network</span>
          <span className="hover:text-[#FF6321] cursor-pointer">Archive</span>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
