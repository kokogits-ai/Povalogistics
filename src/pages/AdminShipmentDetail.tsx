import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { Shipment, TrackingUpdate } from "../types";
import { 
  ChevronLeft, Save, Trash2, Package, User, MapPin, 
  Activity, Tag, Truck, Plus
} from "lucide-react";
import { format } from "date-fns";

export default function AdminShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  
  const [formData, setFormData] = useState<Partial<Shipment>>({
    trackingNumber: "REM-" + Math.floor(10000000 + Math.random() * 90000000),
    status: "Pending",
    isPaused: false,
    holdReason: "",
    estimatedDelivery: "",
    sender: { name: "", email: "", phone: "", address: "", city: "", country: "" },
    receiver: { name: "", email: "", phone: "", address: "", city: "", country: "" },
    package: { title: "", weight: "0", quantity: 1, shippingMethod: "Sea Freight", priority: "Normal" },
    origin: { city: "", country: "", lat: 0, lng: 0 },
    destination: { city: "", country: "", lat: 0, lng: 0 },
    current: { city: "", country: "", lat: 0, lng: 0 },
    images: []
  });

  const [newUpdate, setNewUpdate] = useState<Partial<TrackingUpdate>>({
    status: "Processing",
    location: "",
    description: ""
  });

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      if (!isNew && id) {
        await fetchShipment(id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/check");
      if (!res.ok) navigate("/admin/login");
    } catch (err) {
      navigate("/admin/login");
    }
  };

  const fetchShipment = async (shipmentId: string) => {
    try {
      // For editing, we use the public tracking route but it's okay since we are in admin
      // Actually we should have a specific admin route for fetching by ID
      // but I'll use the public one and handle ID or trackingNumber
      const res = await fetch(`/api/shipments/${shipmentId}`); 
      // Wait, our API takes trackingNumber. Admin UI uses record ID.
      // I'll update the server to include GET /api/admin/shipments/:id
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/shipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const data = await res.json();
          navigate(`/admin/shipment/${data.trackingNumber}`); // Navigate to tracking number based view
        }
      } else if (id) {
        const res = await fetch(`/api/admin/shipments/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          alert("Shipment updated successfully");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving shipment");
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!formData.id || isNew) return;
    if (!newUpdate.status || !newUpdate.location) {
      alert("Please fill in status and location");
      return;
    }
    try {
      const res = await fetch(`/api/admin/shipments/${formData.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUpdate)
      });
      if (res.ok) {
        setNewUpdate({ status: "Processing", location: "", description: "" });
        fetchShipment(formData.trackingNumber!);
      }
    } catch (err) {
      alert("Error adding update");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !formData.id) return;

    try {
      setSaving(true);
      const storageRef = ref(storage, `shipments/${formData.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newImgs = [...(formData.images || [])];
      newImgs[index] = url;
      const updatedData = {...formData, images: newImgs};
      setFormData(updatedData);
      
      // Update DB immediately
      await fetch(`/api/admin/shipments/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImgs })
      });
      
      alert("Asset Identity Token synchronized.");
    } catch (err) {
      console.error(err);
      alert("Relay error: Could not synchronize asset token.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (window.confirm("Delete this update?")) {
      // Need a delete update API or just ignore for now
      alert("Delete update integration coming soon.");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return format(d, "MMM dd • HH:mm");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate("/admin")}
               className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
             >
               <ChevronLeft size={24} />
             </button>
             <div>
               <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{isNew ? "Create Manifest" : "Edit Manifest"}</h1>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formData.trackingNumber}</p>
             </div>
           </div>
           
           <button 
             form="shipment-form"
             disabled={saving}
             className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
           >
             <Save size={18} />
             {saving ? "Deploying..." : isNew ? "Initialize Manifest" : "Commit Changes"}
           </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <form id="shipment-form" onSubmit={handleSave} className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Base Details */}
            <Section title="Manifest Parameters" icon={<Activity className="text-[#FF6321]" />}>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                   <Label>Registration Token</Label>
                   <input 
                     type="text" readOnly 
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none font-mono text-xs font-bold text-slate-400 uppercase"
                     value={formData.trackingNumber}
                   />
                </div>
                <div>
                   <Label>Estimated Relay Protocol</Label>
                   <input 
                     type="text" placeholder="e.g. OCT 24, 2023"
                     className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold uppercase text-xs"
                     value={formData.estimatedDelivery}
                     onChange={(e) => setFormData({...formData, estimatedDelivery: e.target.value})}
                   />
                </div>
                <div>
                   <Label>Duty Clearance Status</Label>
                   <select 
                     className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-black uppercase text-xs"
                     value={formData.dutyFees}
                     onChange={(e) => setFormData({...formData, dutyFees: e.target.value})}
                   >
                     <option value="Paid">Cleared / Paid</option>
                     <option value="Unpaid">Uncleared / Unpaid</option>
                     <option value="Pending">System Pending</option>
                   </select>
                </div>
                <div>
                  <Label>Fee Assessment (USD)</Label>
                  <input 
                    type="text" placeholder="e.g. $1,800.00"
                    className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-xs"
                    value={formData.clearanceFee}
                    onChange={(e) => setFormData({...formData, clearanceFee: e.target.value})}
                  />
                </div>
              </div>
            </Section>

            {/* Sender & Receiver */}
            <div className="grid md:grid-cols-2 gap-8">
               <Section title="Origin Entity" icon={<User className="text-[#FF6321]" />}>
                  <div className="space-y-4">
                     <Input label="Identity Name" value={formData.sender?.name} onChange={v => setFormData({...formData, sender: {...formData.sender!, name: v}})} />
                     <Input label="Secure Email" value={formData.sender?.email} onChange={v => setFormData({...formData, sender: {...formData.sender!, email: v}})} />
                     <Input label="Contact Matrix" value={formData.sender?.phone} onChange={v => setFormData({...formData, sender: {...formData.sender!, phone: v}})} />
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Terminal City" value={formData.sender?.city} onChange={v => setFormData({...formData, sender: {...formData.sender!, city: v}})} />
                        <Input label="Global Country" value={formData.sender?.country} onChange={v => setFormData({...formData, sender: {...formData.sender!, country: v}})} />
                     </div>
                  </div>
               </Section>
               <Section title="Destination Entity" icon={<User className="text-[#FF6321]" />}>
                  <div className="space-y-4">
                     <Input label="Identity Name" value={formData.receiver?.name} onChange={v => setFormData({...formData, receiver: {...formData.receiver!, name: v}})} />
                     <Input label="Secure Email" value={formData.receiver?.email} onChange={v => setFormData({...formData, receiver: {...formData.receiver!, email: v}})} />
                     <Input label="Contact Matrix" value={formData.receiver?.phone} onChange={v => setFormData({...formData, receiver: {...formData.receiver!, phone: v}})} />
                     <Input label="Delivery Node Address" value={formData.receiver?.address} onChange={v => setFormData({...formData, receiver: {...formData.receiver!, address: v}})} />
                  </div>
               </Section>
            </div>

            {/* Asset Details */}
            <Section title="Asset Specifications" icon={<Package className="text-[#FF6321]" />}>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input label="Asset Title / Identifier" value={formData.package?.title} onChange={v => setFormData({...formData, package: {...formData.package!, title: v}})} />
                  </div>
                  <Input label="Net Weight (KG)" value={formData.package?.weight} onChange={v => setFormData({...formData, package: {...formData.package!, weight: v}})} />
                  <div>
                     <Label>Transit Protocol</Label>
                     <select 
                       className="w-full border border-slate-200 rounded-xl p-4 outline-none font-bold uppercase text-xs focus:ring-4 focus:ring-orange-500/10 transition-all font-bold"
                       value={formData.package?.shippingMethod}
                       onChange={(e) => setFormData({...formData, package: {...formData.package!, shippingMethod: e.target.value}})}
                     >
                        <option>Sea Freight</option>
                        <option>Air Freight</option>
                        <option>Road Transport</option>
                        <option>Express Courier</option>
                     </select>
                  </div>
               </div>
            </Section>

            {/* Route Details */}
            <Section title="Relay Route Configuration" icon={<MapPin className="text-[#FF6321]" />}>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Node</h4>
                     <Input label="Inbound City" value={formData.origin?.city} onChange={v => setFormData({...formData, origin: {...formData.origin!, city: v}})} />
                     <Input label="Inbound Country" value={formData.origin?.country} onChange={v => setFormData({...formData, origin: {...formData.origin!, country: v}})} />
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="X-COORD" value={formData.origin?.lat?.toString()} onChange={v => setFormData({...formData, origin: {...formData.origin!, lat: parseFloat(v) || 0}})} />
                        <Input label="Y-COORD" value={formData.origin?.lng?.toString()} onChange={v => setFormData({...formData, origin: {...formData.origin!, lng: parseFloat(v) || 0}})} />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Tracker Node</h4>
                     <Input label="Current City" value={formData.current?.city} onChange={v => setFormData({...formData, current: {...formData.current!, city: v}})} />
                     <Input label="Current Country" value={formData.current?.country} onChange={v => setFormData({...formData, current: {...formData.current!, country: v}})} />
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="X-COORD" value={formData.current?.lat?.toString()} onChange={v => setFormData({...formData, current: {...formData.current!, lat: parseFloat(v) || 0}})} />
                        <Input label="Y-COORD" value={formData.current?.lng?.toString()} onChange={v => setFormData({...formData, current: {...formData.current!, lng: parseFloat(v) || 0}})} />
                     </div>
                  </div>
               </div>
            </Section>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <Section title="System Controls" icon={<Tag className="text-[#FF6321]" />}>
               <div className="space-y-6">
                  <div>
                     <Label>Master Operation Logic</Label>
                     <select 
                        className="w-full border border-slate-200 rounded-xl p-4 outline-none bg-[#0F172A] font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-slate-100"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                     >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>In Transit</option>
                        <option>On Hold</option>
                        <option>Awaiting Payment</option>
                        <option>Customs Hold</option>
                        <option>Out For Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                     </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-slate-100 rounded-2xl border border-slate-200">
                     <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Inhibit Signal</p>
                        <p className="text-[10px] text-slate-400 font-bold">Block external satellite sync</p>
                     </div>
                     <input 
                       type="checkbox" 
                       className="w-6 h-6 rounded-lg accent-[#FF6321]"
                       checked={formData.isPaused}
                       onChange={(e) => setFormData({...formData, isPaused: e.target.checked})}
                     />
                  </div>
                  
                  {formData.isPaused && (
                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                       <Label>Halt Protocol Justification</Label>
                       <textarea 
                         className="w-full bg-white border border-orange-200 rounded-xl p-4 outline-none font-bold text-xs mt-2"
                         placeholder="e.g. Protocol 12-B: Customs Clearance required"
                         value={formData.holdReason}
                         onChange={(e) => setFormData({...formData, holdReason: e.target.value})}
                       />
                    </div>
                  )}
               </div>
            </Section>

            {/* Timeline Updates */}
            {!isNew && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-[#0F172A] flex items-center justify-between text-white shrink-0">
                   <div className="flex items-center gap-3">
                     <Activity className="text-[#FF6321]" size={18} />
                     <h3 className="font-black uppercase tracking-widest text-xs">Relay Log</h3>
                   </div>
                   <span className="bg-[#FF6321] text-white text-[9px] font-black px-2 py-0.5 rounded-full">{updates.length}</span>
                </div>
                
                <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
                   {/* Add Update Form */}
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shrink-0">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Manual Injection</h4>
                      <div className="space-y-3">
                        <select 
                           className="w-full text-[10px] border border-slate-200 rounded-xl p-3 outline-none font-black uppercase"
                           value={newUpdate.status}
                           onChange={(e) => setNewUpdate({...newUpdate, status: e.target.value})}
                        >
                           <option>Processing</option>
                           <option>In Transit</option>
                           <option>Arrived Facility</option>
                           <option>Customs Check</option>
                           <option>On Hold</option>
                           <option>Delivered</option>
                        </select>
                        <input 
                          type="text" placeholder="Relay Node City"
                          className="w-full text-xs border border-slate-200 rounded-xl p-4 outline-none font-bold uppercase transition-all focus:ring-4 focus:ring-orange-500/5 placeholder:text-slate-300"
                          value={newUpdate.location}
                          onChange={(e) => setNewUpdate({...newUpdate, location: e.target.value})}
                        />
                        <button 
                          type="button"
                          onClick={handleAddUpdate}
                          className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                        >
                           Commit Relay
                        </button>
                      </div>
                   </div>

                   {/* Updates List */}
                   <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {updates.map((update) => (
                        <div key={update.id} className="relative pl-6 pb-6 last:pb-0 group">
                           <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#FF6321] z-10 shadow-[0_0_8px_rgba(255,99,33,0.5)]"></div>
                           <div className="absolute left-[3.5px] top-4 bottom-0 w-[1px] bg-slate-100"></div>
                           
                           <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(update.timestamp)}</p>
                                <p className="text-xs font-black text-slate-800 uppercase">{update.status}</p>
                                <p className="text-[10px] text-slate-500 font-bold">{update.location}</p>
                             </div>
                             <button 
                               type="button"
                               onClick={() => update.id && handleDeleteUpdate(update.id)}
                               className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                             >
                                <Trash2 size={14} />
                             </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
            
            {/* Identity Tokens (Images) */}
            {!isNew && (
               <Section title="Asset Registry" icon={<Truck className="text-[#FF6321]" />}>
                  <div className="grid grid-cols-2 gap-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="aspect-square bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden group">
                         {formData.images?.[i] ? (
                           <>
                             <img src={formData.images[i]} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                             <button 
                               type="button"
                               onClick={() => {
                                 const newImgs = [...(formData.images || [])];
                                 newImgs.splice(i, 1);
                                 setFormData({...formData, images: newImgs});
                               }}
                               className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                                <Trash2 size={24} />
                             </button>
                           </>
                         ) : (
                           <label className="cursor-pointer text-slate-300 hover:text-[#FF6321] transition-transform hover:scale-110">
                              <Plus size={24} />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, i)}
                              />
                           </label>
                         )}
                      </div>
                    ))}
                  </div>
               </Section>
            )}

          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, icon, children, className }: { title: string, icon: any, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
         <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
       <Label>{label}</Label>
       <input 
         type="text"
         className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all text-xs font-bold uppercase tracking-tight placeholder:text-slate-200"
         value={value || ""}
         onChange={(e) => onChange(e.target.value)}
       />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
      {children}
    </label>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
